#!/usr/bin/env python3
from pathlib import Path
from io import BytesIO
from PIL import Image
from playwright.sync_api import sync_playwright
import json, base64
ROOT=Path(__file__).resolve().parents[1]
files={}
for filename in ('assets/sample-coast.jpg','assets/sample-depth.png','assets/sample-mask.png','assets/demo-tactile-preview.png','assets/mark.svg'):
 f=ROOT/filename
 media='image/jpeg' if filename.endswith('.jpg') else 'image/svg+xml' if filename.endswith('.svg') else 'image/png'
 files[filename]='data:'+media+';base64,'+base64.b64encode(f.read_bytes()).decode()
html=(ROOT/'index.html').read_text()
core=(ROOT/'src/core.mjs').read_text().replace('export ','')
printer=(ROOT/'src/print.mjs').read_text().split('\n',3)[3].replace('export ','')
app=(ROOT/'src/app.mjs').read_text().split('\n',2)[2]
for filename,data in files.items():
 html=html.replace(filename,data)
 app=app.replace(filename,data)
html=html.replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+ (ROOT/'src/styles.css').read_text() +'</style>')
html=html.replace('</body>','<script type="module">'+core+'\n'+printer+'\n'+app+'</script></body>')
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for kind,width,height in [('desktop',1440,900),('mobile',390,844)]:
   page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.set_content(html,wait_until='domcontentloaded')
   page.locator('#downloadSVG').wait_for(state='attached')
   page.wait_for_function('!document.querySelector("#downloadSVG").disabled',timeout=20000)
   assert page.locator('#inferBadge').inner_text()=='ILLUSTRATIVE SAMPLE'
   assert len(page.locator('.region').all())>=4
   page.locator('#simplifyDraft').click(force=True)
   page.wait_for_timeout(800)
   assert int(page.locator('#detail').input_value())==3
   assert page.locator('#textures').is_checked()==False
   assert len(page.locator('.region input:checked').all())==4
   if kind=='desktop':
    with page.expect_download() as sample_print:
     page.locator('#downloadPrint').click(force=True)
    sample_print.value.save_as(str(ROOT/'assets'/'sample-a4-print.svg'))
   page.once('dialog',lambda d:d.accept('Coastal water corrected'))
   page.locator('.rename-region').first.click(force=True)
   page.wait_for_timeout(300)
   assert 'Coastal water corrected' in page.locator('#regionList').inner_text()
   with page.expect_download() as info:page.locator('#downloadSVG').click(force=True)
   assert info.value.suggested_filename.endswith('.svg')
   with page.expect_download() as print_info:page.locator('#downloadPrint').click(force=True)
   downloaded=print_info.value
   assert downloaded.suggested_filename.endswith('-a4-print-lab.svg')
   print_target=ROOT/'media'/f'_print_{kind}.svg'
   downloaded.save_as(str(print_target))
   from xml.etree import ElementTree as ET
   svg_node=ET.parse(print_target).getroot()
   assert svg_node.attrib['width']=='297mm' and svg_node.attrib['height']=='210mm'
   with page.expect_download() as info:page.locator('#downloadGuide').click(force=True)
   assert info.value.suggested_filename=='touchscape-review-guide.txt'
   with page.expect_download() as info:page.locator('#downloadReport').click(force=True)
   f=info.value
   fn=ROOT/'media'/f'_smoke_{kind}.json'
   f.save_as(str(fn))
   report=json.loads(fn.read_text())
   assert len(report['humanCorrections'])==1
   img=Image.new('RGB',(240,180))
   for y in range(180):
    for x in range(240):img.putpixel((x,y),(25,170,200) if x<120 else (230,110,80))
   io=BytesIO();img.save(io,format='PNG')
   page.locator('#photoInput').set_input_files({'name':'demo.png','mimeType':'image/png','buffer':io.getvalue()})
   page.wait_for_function('document.querySelector("#inferBadge").textContent === "OFFLINE • NON-AI"',timeout=20000)
   assert page.locator('.rename-region').count()>0
   page.screenshot(path=str(ROOT/'assets'/f'final-{kind}-studio.png'),full_page=False)
   assert not errors, errors
   results.append({'viewport':kind,'sample':True,'simplify':True,'correct_labels':True,'svg_export':True,'a4_mm_export':True,'review_guide':True,'analysis_manifest':True,'upload':True,'js_errors':errors})
   page.close()
  browser.close()
finally:pass
print(json.dumps(results,indent=2))
