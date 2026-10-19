import http.client, importlib.util, json, secrets, tempfile, threading, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('studio',Path(__file__).with_name('studio.py'))
studio=importlib.util.module_from_spec(spec);spec.loader.exec_module(studio)
QUESTION={'id':'test-1','grade':'3','standard':'3.OA.C.7','title':'Equal groups','prompt':'What is 3 × 4?','correctAnswer':12,'options':[7,12,9,16],'explanation':'3 × 4 = 12.','hint':'Draw three equal groups.'}
class StudioTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();studio.DATA=Path(self.temp.name);(studio.DATA/'sources').mkdir();studio.connect().close()
  self.server=studio.ThreadingHTTPServer(('127.0.0.1',0),studio.Handler);self.server.login_token=secrets.token_urlsafe(32);self.server.sessions={};self.server.failures=0;self.server.login_blocked_until=0;self.server.publish_lock=threading.Lock()
  self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start();self.port=self.server.server_port
 def tearDown(self):self.server.shutdown();self.server.server_close();self.thread.join();self.temp.cleanup()
 def call(self,path,payload=None,cookie=None,csrf=None,origin=True,host=None):
  client=http.client.HTTPConnection('127.0.0.1',self.port);headers={}
  if host:headers['Host']=host
  if origin:headers['Origin']=f'http://127.0.0.1:{self.port}'
  if cookie:headers['Cookie']=cookie
  if csrf:headers['X-CSRF-Token']=csrf
  body=json.dumps(payload) if payload is not None else None
  if body:headers['Content-Type']='application/json'
  client.request('POST' if body else 'GET',path,body,headers);res=client.getresponse();text=res.read().decode();result=(res.status,json.loads(text),res.getheader('Set-Cookie'));client.close();return result
 def login(self):
  status,_,cookie=self.call('/api/login',{'token':self.server.login_token});self.assertEqual(status,200);cookie=cookie.split(';')[0]
  status,data,_=self.call('/api/drafts',cookie=cookie);self.assertEqual(status,200);return cookie,data['csrf']
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
 def test_login_throttle(self):
  for _ in range(5):self.assertEqual(self.call('/api/login',{'token':'incorrect'})[0],401)
  self.assertEqual(self.call('/api/login',{'token':self.server.login_token})[0],429)
 def test_public_export_whitelist(self):
  clean=studio.public_question({**QUESTION,'learnerName':'PRIVATE','source_file':'PRIVATE','raw_scan':'PRIVATE'})
  self.assertNotIn('learnerName',clean);self.assertNotIn('source_file',clean);self.assertNotIn('raw_scan',clean)
if __name__=='__main__':unittest.main()
