from unittest.mock import patch
import base64, time
import http.client, importlib.util, json, secrets, tempfile, threading, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('studio',Path(__file__).with_name('studio.py'))
studio=importlib.util.module_from_spec(spec);spec.loader.exec_module(studio)
QUESTION={'id':'test-1','grade':'3','standard':'3.OA.C.7','title':'Equal groups','prompt':'What is 3 × 4?','correctAnswer':12,'options':[7,12,9,16],'explanation':'3 × 4 = 12.','hint':'Draw three equal groups.'}
class StudioTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();studio.DATA=Path(self.temp.name);(studio.DATA/'sources').mkdir();studio.connect().close()
  self.server=studio.ThreadingHTTPServer(('127.0.0.1',0),studio.Handler);self.server.login_token=secrets.token_urlsafe(32);self.server.sessions={};self.server.failures=0;self.server.login_blocked_until=0;self.server.publish_lock=threading.Lock();self.server.auth_lock=threading.Lock()
  self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start();self.port=self.server.server_port
 def tearDown(self):self.server.shutdown();self.server.server_close();self.thread.join();self.temp.cleanup()
 def call(self,path,payload=None,cookie=None,csrf=None,origin=True,host=None):
  client=http.client.HTTPConnection('127.0.0.1',self.port);headers={}
  if host:headers['Host']=host
  if origin:headers['Origin']=origin if isinstance(origin,str) else f'http://127.0.0.1:{self.port}'
  if cookie:headers['Cookie']=cookie
  if csrf:headers['X-CSRF-Token']=csrf
  body=json.dumps(payload) if payload is not None else None
  if body:headers['Content-Type']='application/json'
  client.request('POST' if body else 'GET',path,body,headers);res=client.getresponse();text=res.read().decode();result=(res.status,json.loads(text),res.getheader('Set-Cookie'));client.close();return result
 def login(self):
  
  if studio.owner() is None:self.call('/api/setup',{'token':self.server.login_token,'username':'massi','password':'a long private password'})
  status,_,cookie=self.call('/api/login',{'username':'massi','password':'a long private password'});self.assertEqual(status,200);cookie=cookie.split(';')[0]
  status,data,_=self.call('/api/drafts',cookie=cookie);self.assertEqual(status,200);return cookie,data['csrf']
 def test_release_identity_requires_a_session(self):
  self.assertEqual(self.call('/api/release')[0],401)
  cookie,_=self.login()
  status,data,_=self.call('/api/release',cookie=cookie)
  self.assertEqual(status,200);self.assertIsInstance(data['revision'],str);self.assertIsInstance(data['modified'],bool)
  self.assertEqual(data['deployment'],'Not verified by Studio')
 def test_standards_endpoint_returns_an_array(self):
  status,data,_=self.call('/standards.json')
  self.assertEqual(status,200);self.assertIsInstance(data,list);self.assertEqual(len(data),84)
  self.assertTrue(all('grade' in standard and 'code' in standard for standard in data))
 def test_additional_lan_origin_is_explicit(self):
  origin='https://studio.massinissatinouche.com:8466'
  with patch.dict(studio.os.environ,{'BIP_STUDIO_ADDITIONAL_ORIGINS':origin}):
   self.assertEqual(self.call('/api/auth-state',host='studio.massinissatinouche.com:8466')[0],200)
   self.assertEqual(self.call('/api/login',{'username':'not-configured','password':'not-a-secret'},host='studio.massinissatinouche.com:8466',origin=origin)[0],401)
   self.assertEqual(self.call('/api/login',{'username':'x','password':'x'},host='studio.massinissatinouche.com:8466',origin='https://untrusted.example')[0],403)
 def test_auth_host_and_csrf(self):
  self.assertEqual(self.call('/api/drafts')[0],401)
  self.assertEqual(self.call('/api/drafts',host='evil.example')[0],400)
  self.assertEqual(self.call('/api/login',{'token':self.server.login_token},origin=False)[0],403)
  cookie,csrf=self.login()
  self.assertEqual(self.call('/api/save',{'question':QUESTION},cookie=cookie)[0],403)
  self.assertEqual(self.call('/api/save',{'question':QUESTION},cookie=cookie,csrf=csrf)[0],200)
 def test_approval_export_and_edit_invalidation(self):
  cookie,csrf=self.login()
  self.assertEqual(self.call('/api/save',{'question':QUESTION,'approved':True},cookie,csrf)[0],400)
  self.assertEqual(self.call('/api/save',{'question':QUESTION,'approved':True,'humanReviewed':True},cookie,csrf)[0],200)
  status,package,_=self.call('/api/export',{},cookie,csrf);self.assertEqual(status,200);self.assertEqual(len(package['questions']),1)
  changed={**QUESTION,'prompt':'What is 3 × 4?','source_file':'private.jpg'}
  self.assertEqual(self.call('/api/save',{'question':changed},cookie,csrf)[0],200)
  self.assertEqual(self.call('/api/export',{},cookie,csrf)[0],400)
  with studio.connect() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM history').fetchone()[0],1)
 def test_wrong_answer_and_unconfigured_publish_stop(self):
  cookie,csrf=self.login();wrong={**QUESTION,'correctAnswer':13,'options':[7,13,9,16]}
  self.assertEqual(self.call('/api/save',{'question':wrong,'approved':True,'humanReviewed':True},cookie,csrf)[0],400)
  self.assertEqual(self.call('/api/publish',{'confirmed':True},cookie,csrf)[0],400)
 def test_logout_revokes_session(self):
  cookie,csrf=self.login()
  self.assertEqual(self.call('/api/logout',{},cookie)[0],403)
  self.assertEqual(self.call('/api/logout',{},cookie,csrf)[0],200)
  self.assertEqual(self.call('/api/drafts',cookie=cookie)[0],401)
  self.assertEqual(self.call('/api/save',{'question':QUESTION},cookie,csrf)[0],403)
 def test_setup_recovery_and_no_token_bypass(self):
  self.assertTrue(self.call('/api/auth-state')[1]['setup_required'])
  token=self.server.login_token
  self.assertEqual(self.call('/api/setup',{'token':token,'username':'massi','password':'short'})[0],400)
  status,data,cookie=self.call('/api/setup',{'token':token,'username':'massi','password':'a long private password'})
  self.assertEqual(status,200);codes=data['recovery_codes'];self.assertEqual(len(codes),8)
  self.assertFalse(self.call('/api/auth-state')[1]['setup_required'])
  self.assertEqual(self.call('/api/setup',{'token':token})[0],409)
  self.assertEqual(self.call('/api/login',{'token':token})[0],401)
  self.assertEqual(self.call('/api/login',{'username':'massi','password':'wrong'})[0],401)
  self.assertEqual(self.call('/api/recover',{'code':'wrong','password':'another private password'})[0],401)
  status,new,_=self.call('/api/recover',{'code':codes[0],'password':'another private password'})
  self.assertEqual(status,200)
  self.assertEqual(self.call('/api/drafts',cookie=cookie.split(';')[0])[0],401)
  self.assertEqual(self.call('/api/recover',{'code':codes[1],'password':'another private password'})[0],401)
  self.assertEqual(self.call('/api/login',{'username':'massi','password':'a long private password'})[0],401)
  self.assertEqual(self.call('/api/login',{'username':'massi','password':'another private password'})[0],200)
  row=studio.owner();self.assertNotIn('another private password',str(row));self.assertNotIn(new['recovery_codes'][0],str(row))
 def test_password_change_requires_current_password(self):
  cookie,csrf=self.login()
  self.assertEqual(self.call('/api/password',{'currentPassword':'wrong','password':'another private password'},cookie,csrf)[0],400)
  self.assertEqual(self.call('/api/password',{'currentPassword':'a long private password','password':'another private password'},cookie,csrf)[0],200)
  self.assertEqual(self.call('/api/drafts',cookie=cookie)[0],401)
 def test_totp_known_vector_and_replay(self):
  secret=base64.b32encode(b'12345678901234567890').decode()
  self.assertEqual(studio.totp(secret,1,8),'94287082')
  self.assertEqual(studio.accept_totp(secret,'287082',now=59),1)
  self.assertIsNone(studio.accept_totp(secret,'287082',last_step=1,now=59))
  self.assertIsNone(studio.accept_totp(secret,'287082',now=180))
  self.assertIsNone(studio.accept_totp(secret,'abcdef',now=59))
 def test_mfa_enrol_login_replay_and_recovery(self):
  cookie,csrf=self.login();now=int(time.time()//30)*30+5
  self.assertEqual(self.call('/api/mfa/begin',{'password':'wrong'},cookie,csrf)[0],401)
  status,data,_=self.call('/api/mfa/begin',{'password':'a long private password'},cookie,csrf)
  self.assertEqual(status,200);secret=data['secret'];self.assertTrue(data['uri'].startswith('otpauth://totp/'))
  self.assertIsNone(studio.mfa_state())
  self.assertEqual(self.call('/api/mfa/enable',{'otp':'bad'},cookie,csrf)[0],401)
  with patch.object(studio.time,'time',return_value=now):
   status,data,_=self.call('/api/mfa/enable',{'otp':studio.totp(secret,now//30)},cookie,csrf)
   self.assertEqual(status,200);codes=data['recovery_codes']
   self.assertEqual(self.call('/api/drafts',cookie=cookie)[0],401)
   self.assertEqual(self.call('/api/login',{'username':'massi','password':'a long private password'})[0],401)
   self.assertEqual(self.call('/api/login',{'username':'massi','password':'a long private password','otp':studio.totp(secret,now//30)})[0],401)
  with patch.object(studio.time,'time',return_value=now+30):
   status,_,cookie=self.call('/api/login',{'username':'massi','password':'a long private password','otp':studio.totp(secret,now//30+1)})
   self.assertEqual(status,200);cookie=cookie.split(';')[0]
   status,data,_=self.call('/api/drafts',cookie=cookie);self.assertTrue(data['mfa_enabled']);csrf=data['csrf']
   self.assertEqual(self.call('/api/password',{'currentPassword':'a long private password','password':'another private password'},cookie,csrf)[0],400)
   self.assertEqual(self.call('/api/mfa/disable',{'password':'a long private password','otp':'bad'},cookie,csrf)[0],401)
   status,data,_=self.call('/api/recover',{'code':codes[0],'password':'another private password'})
   self.assertEqual(status,200);self.assertTrue(data['mfa_reset']);self.assertIsNone(studio.mfa_state())
   self.assertEqual(self.call('/api/drafts',cookie=cookie)[0],401)
 def test_mfa_setup_expiry_and_password_preserves_mfa(self):
  cookie,csrf=self.login();now=int(time.time()//30)*30+5
  status,data,_=self.call('/api/mfa/begin',{'password':'a long private password'},cookie,csrf);secret=data['secret']
  for session in self.server.sessions.values():session['mfa_pending']['expires']=0
  self.assertEqual(self.call('/api/mfa/enable',{'otp':studio.totp(secret,now//30)},cookie,csrf)[0],400)
  with studio.connect() as db:db.execute('INSERT INTO mfa VALUES (1,?,-1)',(secret,))
  with patch.object(studio.time,'time',return_value=now):
   self.assertEqual(self.call('/api/password',{'currentPassword':'a long private password','password':'another private password','otp':studio.totp(secret,now//30)},cookie,csrf)[0],200)
  self.assertIsNotNone(studio.mfa_state())
  with patch.object(studio.time,'time',return_value=now+30):
   status,_,cookie=self.call('/api/login',{'username':'massi','password':'another private password','otp':studio.totp(secret,now//30+1)})
   self.assertEqual(status,200);cookie=cookie.split(';')[0];csrf=self.call('/api/drafts',cookie=cookie)[1]['csrf']
  with patch.object(studio.time,'time',return_value=now+60):
   self.assertEqual(self.call('/api/mfa/disable',{'password':'another private password','otp':studio.totp(secret,now//30+2)},cookie,csrf)[0],200)
   self.assertIsNone(studio.mfa_state())
   self.assertEqual(self.call('/api/drafts',cookie=cookie)[0],401)
 def test_login_throttle(self):
  for _ in range(5):self.assertEqual(self.call('/api/login',{'token':'incorrect'})[0],401)
  self.assertEqual(self.call('/api/login',{'token':self.server.login_token})[0],429)
 def test_public_export_whitelist(self):
  clean=studio.public_question({**QUESTION,'learnerName':'PRIVATE','source_file':'PRIVATE','raw_scan':'PRIVATE'})
  self.assertNotIn('learnerName',clean);self.assertNotIn('source_file',clean);self.assertNotIn('raw_scan',clean)
if __name__=='__main__':unittest.main()
