
/* Integration regression: run after npm run build.
   BIP_PLAYWRIGHT_MODULE may point to an installed Playwright package. */
const {chromium}=require(process.env.BIP_PLAYWRIGHT_MODULE||'playwright');
const {spawn}=require('node:child_process'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=process.env.BIP_TEST_ORIGIN||'http://127.0.0.1:5196';
const server=process.env.BIP_TEST_ORIGIN?null:spawn(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','5196','--strictPort'],{cwd:root,stdio:'ignore'});
(async()=>{let browser;try{
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,150));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const viewport of [{width:1280,height:900},{width:900,height:700},{width:390,height:844}]){
  const context=await browser.newContext({viewport,serviceWorkers:'allow'}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base);await p.evaluate(()=>navigator.serviceWorker.ready);
  await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await p.reload();await p.getByRole('button',{name:/Kids’ World/}).click();
  const frame=p.frameLocator('iframe[title="Bip 3D companion"]').first();
  await frame.locator('#bip-stage[data-mode="3d"]').waitFor({timeout:25000});
  assert.equal(await frame.locator('#root').count(),0,'React app shell must never render inside Bip');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow at '+viewport.width);
  const mainBox=await p.locator('.kids-main').boundingBox(),bipBox=await p.locator('.journey-bip').boundingBox();
  if(viewport.width<=760)assert(mainBox.y<bipBox.y,'Mobile learner choices come first');else assert(bipBox.x<mainBox.x,'Desktop has aligned columns');
  assert.equal(await p.locator('.journey-bip').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  await p.locator('.bip-moves summary').first().click();
  await p.getByRole('button',{name:'Robot dance',exact:true}).first().click();
  await frame.locator('#character-state').filter({hasText:'Robot dance · pop and lock!'}).waitFor({state:'attached'});
  await p.screenshot({path:path.join(root,'pwa-character-'+viewport.width+'.png'),fullPage:true});
  // Verify a cached character navigation remains an actual viewer when offline.
  await context.setOffline(true);const child=p.frames().find(f=>f.url().includes('/bip/character/index.html'));
  await child.goto(base+'/bip/character/index.html?controls=none');
  await frame.locator('#bip-stage[data-mode="3d"]').waitFor({timeout:25000});
  assert.equal(await frame.locator('#root').count(),0);
  assert.deepEqual(errors,[]);console.log('PWA_CHARACTER_PASS',viewport.width,'online reload + offline viewer');
  await context.close();
 }
 }finally{if(browser)await browser.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;server?.kill();});
