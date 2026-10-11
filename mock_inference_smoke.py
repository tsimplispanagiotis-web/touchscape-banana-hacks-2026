#!/usr/bin/env python3
"""Contract tests with synthetic model outputs. Does not exercise real model weights!"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, re, json
ROOT=Path(__file__).resolve().parents[1]
files={}
for filename in ('assets/sample-coast.jpg','assets/sample-depth.png','assets/sample-mask.png','assets/demo-tactile-preview.png','assets/mark.svg'):
 f=ROOT/filename
 typ='image/jpeg' if filename.endswith('.jpg') else 'image/svg+xml' if filename.endswith('.svg') else 'image/png'
 files[filename]='data:'+typ+';base64,'+base64.b64encode(f.read_bytes()).decode()
html=(ROOT/'index.html').read_text()
core=(ROOT/'src/core.mjs').read_text().replace('export ','')
printer=(ROOT/'src/print.mjs').read_text().split('\n',3)[3].replace('export ','')
app=(ROOT/'src/app.mjs').read_text().split('\n',2)[2]
for filename,data in files.items():html=html.replace(filename,data);app=app.replace(filename,data)
app=re.sub(r"await import\('https://[^']+'\)",'await Promise.resolve(window.__touchscapeTestLibrary)',app)
mock='''<script>
 window.__mode='full';
 window.__touchscapeTestLibrary={pipeline:async(kind,id)=>{
  const isDepth=kind==='depth-estimation';
  if(window.__mode==='bothfail'||(isDepth&&window.__mode==='depthfail')||(!isDepth&&window.__mode==='segfail'))throw Error('synthetic test failure');
  const fn=async()=>{
   const w=168,h=109;
   if(isDepth){const data=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)data[y*w+x]=Math.floor(y/h*255);return {depth:{data,width:w,height:h,channels:1}};}
   const a=new Uint8Array(w*h),b=new Uint8Array(w*h);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;a[i]=y<h/2?255:0;b[i]=y>=h/2?255:0;}
   return [{label:'sky',mask:{data:a,width:w,height:h,channels:1}},{label:'sea',mask:{data:b,width:w,height:h,channels:1}}];
  };
  fn.dispose=async()=>{};return fn;
 }};
</script>'''
html=html.replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+ (ROOT/'src/styles.css').read_text()+'</style>')
html=html.replace('</body>',mock+'<script type="module">'+core+'\n'+printer+'\n'+app+'</script></body>')
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],headless=True)
 for mode,expected in [('full','DUAL-MODEL AI'),('depthfail','PARTIAL • SEGMENTATION AI'),('segfail','PARTIAL • DEPTH AI'),('bothfail','ILLUSTRATIVE SAMPLE')]:
  page=browser.new_page(accept_downloads=True)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.wait_for_function('!document.querySelector("#downloadSVG").disabled',timeout=10000)
  page.evaluate('(mode)=>{window.__mode=mode}',mode)
  page.locator('#analyzeButton').click(force=True)
  page.wait_for_function('!document.querySelector("#analyzeButton").disabled',timeout=25000)
  page.wait_for_timeout(500)
  badge=page.locator('#inferBadge').inner_text()
  assert badge==expected,(mode,badge,expected,page.locator('#statusText').inner_text())
  if mode!='bothfail':
   with page.expect_download() as info:page.locator('#downloadReport').click(force=True)
   target=ROOT/'media'/f'_mock_{mode}.json'
   info.value.save_as(str(target));manifest=json.loads(target.read_text());assert len(manifest['modelIds'])== (2 if mode=='full' else 1)
  assert not errors,(mode,errors)
  results.append({'synthetic_mode':mode,'displayed_badge':badge,'browser_errors':len(errors),'verified_with_real_weights':False})
  page.close()
 browser.close()
print(json.dumps(results,indent=2))
