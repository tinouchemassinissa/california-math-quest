#!/usr/bin/env python3
"""Private loopback-only draft studio. No public listener, no automatic publishing."""
import hashlib, re, base64, hmac, json, os, secrets, shutil, sqlite3, subprocess, time, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(os.environ.get('BIP_STUDIO_DATA', str(Path.home()/'.local/share/bip-studio'))).resolve()
LIMIT = 12*1024*1024

def connect():
    db=sqlite3.connect(DATA/'studio.sqlite3')
    db.execute('CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, question TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, updated REAL NOT NULL)')
    db.execute('CREATE TABLE IF NOT EXISTS history (draft_id TEXT, question TEXT, approved INTEGER, updated REAL)')
    db.execute('CREATE TABLE IF NOT EXISTS owner (id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, recovery TEXT NOT NULL)')
    db.commit()
    return db

def owner():
    with connect() as db:return db.execute('SELECT username,salt,password_hash,recovery FROM owner WHERE id=1').fetchone()

def password_hash(password,salt):
    return hashlib.scrypt(password.encode(),salt=bytes.fromhex(salt),n=16384,r=8,p=1).hex()

def validate_credentials(username,password):
    if not isinstance(username,str) or not re.fullmatch(r'[A-Za-z0-9_.-]{3,40}',username):raise ValueError('Username: 3–40 letters, numbers, dots, hyphens or underscores')
    if not isinstance(password,str) or not 14<=len(password)<=256:raise ValueError('Use a password or passphrase of 14–256 characters')

def write_owner(db,username,password):
    validate_credentials(username,password)
    salt=secrets.token_hex(16)
    codes=[secrets.token_hex(12) for _ in range(8)]
    hashes=[hashlib.sha256(c.encode()).hexdigest() for c in codes]
    db.execute('INSERT OR REPLACE INTO owner VALUES (1,?,?,?,?)',(username,salt,password_hash(password,salt),json.dumps(hashes)))
    return codes

def check(question):
    image=os.environ.get('BIP_NODE_IMAGE')
    command=['docker','run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--memory','256m','--cpus','0.5','-i','-v',f'{ROOT}:/app:ro','--workdir','/app','--entrypoint','node',image,'/app/scripts/checkAdminQuestion.mjs'] if image else ['node',str(ROOT/'scripts/checkAdminQuestion.mjs')]
    result=subprocess.run(command,input=json.dumps(question),capture_output=True,text=True,timeout=10,cwd=ROOT)
    try:return json.loads(result.stdout)
    except ValueError:return {'valid':False,'error':'The question checker could not run. Install Node.js and review the server logs.'}

def public_question(question):
    fields=['id','grade','standard','title','prompt','correctAnswer','options','explanation','hint','manipulative']
    return {key:question[key] for key in fields if key in question}

def save_draft(question, approved=False):
    question=public_question(question)
    if len(json.dumps(question))>100000:raise ValueError('Question draft is too large')
    identifier=question.get('id')
    if not isinstance(identifier,str) or not identifier or len(identifier)>80 or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_' for c in identifier):raise ValueError('Use a short letters/numbers/hyphens question ID')
    if approved and not check(question).get('valid'):raise ValueError('Question did not pass its implemented checks')
    with connect() as db:
        old=db.execute('SELECT question,approved,updated FROM drafts WHERE id=?',(identifier,)).fetchone()
        if old:db.execute('INSERT INTO history VALUES (?,?,?,?)',(identifier,*old))
        db.execute('INSERT OR REPLACE INTO drafts VALUES (?,?,?,?)',(identifier,json.dumps(question),int(approved),time.time()))
    return identifier

def export_approved():
    with connect() as db:rows=db.execute('SELECT question FROM drafts WHERE approved=1 ORDER BY id').fetchall()
    questions=[public_question(json.loads(row[0])) for row in rows]
    if not questions:raise ValueError('No approved questions')
    for question in questions:
        if not check(question).get('valid'):raise ValueError('An approved question no longer passes checks')
    return {'version':1,'questions':questions}

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args):pass  # Do not log tokens, worksheet text or request bodies.
    def respond(self,status,data,content_type='application/json'):
        body=(json.dumps(data) if content_type=='application/json' else data).encode()
        self.send_response(status);self.send_header('Content-Type',content_type);self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
        if hasattr(self,'new_cookie'):self.send_header('Set-Cookie',f'bip_studio={self.new_cookie}; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800'+('; Secure' if os.environ.get('BIP_STUDIO_ORIGIN','').startswith('https://') else ''))
        self.end_headers();self.wfile.write(body)
    def allowed_origins(self):
        origins={f'http://127.0.0.1:{self.server.server_port}',f'http://localhost:{self.server.server_port}'}
        configured=os.environ.get('BIP_STUDIO_ORIGIN')
        if configured:origins.add(configured)
        return origins
    def valid_host(self):return self.headers.get('Host') in {urlparse(origin).netloc for origin in self.allowed_origins()}
    def session(self):
        cookies={part.strip().split('=',1)[0]:part.strip().split('=',1)[1] for part in self.headers.get('Cookie','').split(';') if '=' in part}
        token=cookies.get('bip_studio','');entry=self.server.sessions.get(token)
        return entry if entry and entry['expires']>time.time() else None
    def do_GET(self):
        if not self.valid_host():return self.respond(400,{'error':'Invalid host'})
        route=urlparse(self.path).path
        if route in ['/','/studio.js','/studio.css']:
            name={'/':'index.html','/studio.js':'studio.js','/studio.css':'studio.css'}[route]
            mime={'/':'text/html; charset=utf-8','/studio.js':'text/javascript','/studio.css':'text/css'}[route]
            return self.respond(200,(ROOT/'admin'/name).read_text(),mime)
        if route=='/api/auth-state':return self.respond(200,{'setup_required':owner() is None})
        session=self.session()
        if not session:return self.respond(401,{'error':'Sign in to your owner account'})
        if route=='/api/drafts':
            with connect() as db:rows=db.execute('SELECT question,approved,updated FROM drafts ORDER BY updated DESC').fetchall()
            return self.respond(200,{'csrf':session['csrf'],'drafts':[{'question':json.loads(q),'approved':bool(a),'updated':t} for q,a,t in rows],'ocr_available':bool(shutil.which('tesseract') or os.environ.get('BIP_OCR_IMAGE')),'source_count':len(list((DATA/'sources').glob('*'))),'source_bytes':sum(p.stat().st_size for p in (DATA/'sources').glob('*') if p.is_file())})
        return self.respond(404,{'error':'Not found'})
    def do_POST(self):
        if not self.valid_host() or self.headers.get('Origin') not in self.allowed_origins():return self.respond(403,{'error':'Use the same-origin loopback studio'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length<=0 or length>LIMIT:return self.respond(413,{'error':'Request too large'})
            payload=json.loads(self.rfile.read(length));route=urlparse(self.path).path
            if route in ['/api/login','/api/setup','/api/recover']:
                if not isinstance(payload,dict):raise ValueError('Invalid request')
                with self.server.auth_lock:
                    if time.time()<self.server.login_blocked_until:return self.respond(429,{'error':'Wait a minute before trying again'})
                    existing=owner();codes=None;valid=False
                    if route=='/api/setup':
                        if existing:return self.respond(409,{'error':'Owner already exists. Sign in instead.'})
                        token=payload.get('token','')
                        valid=isinstance(token,str) and bool(self.server.login_token) and hmac.compare_digest(token,self.server.login_token)
                        if valid:
                            with connect() as db:codes=write_owner(db,payload.get('username'),payload.get('password'))
                            self.server.login_token=''
                            (DATA/'login-token').unlink(missing_ok=True)
                    elif route=='/api/login' and existing:
                        password=payload.get('password','');username=payload.get('username','')
                        if isinstance(password,str) and len(password)<=256 and isinstance(username,str):
                            matched=hmac.compare_digest(password_hash(password,existing[1]),existing[2])
                            valid=hmac.compare_digest(username,existing[0]) and matched
                    elif route=='/api/recover' and existing:
                        code=payload.get('code','')
                        digest=hashlib.sha256(code.encode()).hexdigest() if isinstance(code,str) else ''
                        valid=any(hmac.compare_digest(digest,c) for c in json.loads(existing[3]))
                        if valid:
                            with connect() as db:codes=write_owner(db,existing[0],payload.get('password'))
                    if not valid:
                        self.server.failures+=1
                        if self.server.failures>=5:self.server.login_blocked_until=time.time()+60;self.server.failures=0
                        return self.respond(401,{'error':'Credentials not accepted'})
                    self.server.failures=0;self.new_cookie=secrets.token_urlsafe(32)
                    self.server.sessions={self.new_cookie:{'csrf':secrets.token_urlsafe(32),'expires':time.time()+1800}}
                    return self.respond(200,{'ok':True,'recovery_codes':codes})
            session=self.session()
            if not session or not hmac.compare_digest(self.headers.get('X-CSRF-Token',''),session['csrf']):return self.respond(403,{'error':'Sign in again before changing content'})
            if route=='/api/logout':
                self.server.sessions.clear();self.new_cookie=''
                return self.respond(200,{'ok':True})
            if route=='/api/password':
                with self.server.auth_lock:
                    if time.time()<self.server.login_blocked_until:return self.respond(429,{'error':'Wait a minute before trying again'})
                    existing=owner();password=payload.get('currentPassword','')
                    if not existing or not isinstance(password,str) or len(password)>256 or not hmac.compare_digest(password_hash(password,existing[1]),existing[2]):
                        self.server.failures+=1
                        if self.server.failures>=5:self.server.login_blocked_until=time.time()+60;self.server.failures=0
                        raise ValueError('Current password was not accepted')
                    with connect() as db:codes=write_owner(db,existing[0],payload.get('password'))
                    self.server.sessions.clear()
                    return self.respond(200,{'ok':True,'recovery_codes':codes})
            if route=='/api/check':return self.respond(200,check(public_question(payload['question'])))
            if route=='/api/save':
                approved=payload.get('approved') is True
                if approved and payload.get('humanReviewed') is not True:raise ValueError('Confirm your wording, source and privacy review first')
                return self.respond(200,{'id':save_draft(payload['question'],approved)})
            if route=='/api/export':return self.respond(200,export_approved())
            if route=='/api/clear-sources':
                if payload.get('confirmed') is not True:raise ValueError('Confirm source deletion')
                for source in (DATA/'sources').iterdir():
                    if source.is_file():source.unlink()
                return self.respond(200,{'ok':True})
            if route=='/api/publish':
                if payload.get('confirmed') is not True:raise ValueError('Confirm your reviewed release first')
                repo=os.environ.get('BIP_PUBLISH_REPO')
                if not repo:raise ValueError('Publishing is not configured. Export the reviewed JSON for now.')
                if not self.server.publish_lock.acquire(False):raise ValueError('A release is already being checked')
                try:
                    package=export_approved();release=DATA/'approved-release.json';release.write_text(json.dumps(package));release.chmod(0o600)
                    result=subprocess.run(['node',str(ROOT/'admin/publish.mjs'),str(release),repo],capture_output=True,text=True,timeout=900,cwd=ROOT)
                    if result.returncode:raise ValueError('Release failed its setup or checks. No main-branch merge was performed. Inspect the private checkout.')
                    url=next((line for line in result.stdout.splitlines() if line.startswith('https://github.com/tinouchemassinissa/california-math-quest/pull/')),None)
                    return self.respond(200,{'pull_request':url,'notice':'Review the GitHub preview before merging. Nothing was merged automatically.'})
                finally:self.server.publish_lock.release()
            if route=='/api/ocr':
                if not shutil.which('tesseract') and not os.environ.get('BIP_OCR_IMAGE'):raise ValueError('Tesseract is not installed. Add the question manually for now.')
                raw=base64.b64decode(payload['data'],validate=True)
                if not raw or len(raw)>8*1024*1024:raise ValueError('Image must be no larger than 8 MB')
                extension='png' if raw.startswith(b'\x89PNG\r\n\x1a\n') else 'jpg' if raw.startswith(b'\xff\xd8\xff') else None
                if not extension:raise ValueError('OCR currently supports PNG/JPG only; handwriting and PDFs need manual review')
                if sum(p.stat().st_size for p in (DATA/'sources').iterdir() if p.is_file())+len(raw)>256*1024*1024:raise ValueError('Source images reached 256 MB. Export a private backup and delete stored source images before adding more.')
                source=DATA/'sources'/f'{secrets.token_hex(16)}.{extension}';source.write_bytes(raw);source.chmod(0o600)
                image=os.environ.get('BIP_OCR_IMAGE')
                command=['docker','run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--user',str(os.getuid()),'--memory','512m','--cpus','1','--pids-limit','128','-v',f'{source}:/input.{extension}:ro','--entrypoint','tesseract',image,f'/input.{extension}','stdout','--psm','6'] if image else ['tesseract',str(source),'stdout','--psm','6']
                result=subprocess.run(command,capture_output=True,text=True,timeout=40)
                if result.returncode:raise ValueError('OCR could not read this image. It was retained privately for review.')
                return self.respond(200,{'text':result.stdout[:20000],'notice':'Unverified OCR text. Compare with the original; no questions were approved automatically.'})
            return self.respond(404,{'error':'Not found'})
        except (ValueError,KeyError,TypeError,subprocess.TimeoutExpired) as error:return self.respond(400,{'error':str(error)})
        except Exception:return self.respond(500,{'error':'Operation failed; original data was not published'})

def main():
    os.umask(0o077);DATA.mkdir(parents=True,exist_ok=True);(DATA/'sources').mkdir(exist_ok=True)
    connect().close();token_file=DATA/'login-token';token=''
    if owner() is None:
        token=secrets.token_urlsafe(32);token_file.write_text(token);token_file.chmod(0o600)
    else:token_file.unlink(missing_ok=True)
    port=int(os.environ.get('BIP_STUDIO_PORT','8765'))
    server=ThreadingHTTPServer(('127.0.0.1',port),Handler);server.auth_lock=threading.Lock();server.publish_lock=threading.Lock();server.login_token=token;server.sessions={};server.failures=0;server.login_blocked_until=0
    print(f'Private Studio: http://127.0.0.1:{port}\nLogin token file: {token_file}\nOnly access through a local browser or SSH tunnel.',flush=True)
    server.serve_forever()
if __name__=='__main__':main()
