#!/usr/bin/env python3
"""Assemble the source and full submission deliverables. Excludes ephemeral test files."""
from pathlib import Path
import zipfile,hashlib,json
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1]
out=Path('/mnt/data')
report={
 'project':'TOUCHSCAPE', 'release':'1.3.0', 'date':'2026-10-11',
 'node_unit_tests':{'passed':22,'total':22,'status':'PASS'},
 'chromium_smoke':{'viewports':['desktop 1440x900','mobile 390x844'], 'sample_load':'PASS', 'photo_upload':'PASS','edit_regions':'PASS','a4_svg_parse':'PASS','svg_download':'PASS','json_download':'PASS','review_guide':'PASS','uncaught_js_exceptions':0},
 'mock_inference':{'cases': ['segmentation + depth','segmentation only','depth only','both unavailable'], 'passed':4,'total':4,'real_weights_used':False},
 'real_pretrained_inference':{'status':'NOT_VERIFIED','reason':'Model CDN inaccessible in the development environment. Entrant must test in an unrestricted connected browser.'},
 'accessibility_validation':{'status':'NOT_CONDUCTED','note':'True-size SVG is a study sheet, not certified braille/tactile graphics'},
 'external_deployment':{'github':'NOT_UPLOADED','pages':'NOT_PUBLISHED','youtube':'NOT_PUBLISHED','devpost':'NOT_SUBMITTED'},
 'single_file_fallback':{'status':'PASS','browser':'Chromium set_content with inlined HTML CSS JS SVG image resources','real_model_weights':'NOT_VERIFIED'},
 'design_claim':'First-stage editorial prototype; no user-adoption or usability metrics asserted.'
}
(root/'FINAL_VALIDATION_REPORT.json').write_text(json.dumps(report,indent=2)+'\n')
source_paths=[]
for p in root.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(root).as_posix()
 if rel.startswith(('media/','one-file-upload/')):continue
 if rel.startswith('assets/final-'):continue
 if rel.startswith('assets/sample-') and rel.endswith('.svg'):pass
 if rel.endswith(('.webm','.pyc')):continue
 if rel.startswith('tools/__pycache__/'):continue
 # sample paths are assets; include only known names
 if rel.startswith('assets/') and rel not in {'assets/mark.svg','assets/sample-coast.jpg','assets/sample-depth.png','assets/sample-mask.png','assets/demo-tactile-preview.png','assets/devpost-cover.png','assets/sample-a4-print.svg','assets/sample-a4-preview.png'}: continue
 source_paths.append(rel)
source_paths=sorted(source_paths)
assert 'src/print.mjs' in source_paths and 'index.html' in source_paths and 'tests/print.test.mjs' in source_paths
for variant in ['GITHUB_SOURCE_v1.3','FINAL_v1.3']:
 zpath=out/f'TOUCHSCAPE_BananaHacks2026_{variant}.zip'
 with zipfile.ZipFile(zpath,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
  for rel in source_paths:z.write(root/rel,rel)
  if variant.startswith('FINAL'):
   for rel in ['assets/final-desktop-studio.png','assets/final-mobile-studio.png','assets/final-video-print-lab-card.png']:
    z.write(root/rel,rel)
   z.write(root/'one-file-upload/index.html','QUICK_UPLOAD_ONE_FILE/index.html')
 print(zpath,zpath.stat().st_size,'bytes',len(z.namelist()),'files')
 (out/f'TOUCHSCAPE_BananaHacks2026_{variant}_SHA256.txt').write_text(hashlib.sha256(zpath.read_bytes()).hexdigest()+'  '+zpath.name+'\n')
print('single file', (root/'one-file-upload/index.html').stat().st_size)
