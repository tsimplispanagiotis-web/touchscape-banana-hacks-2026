#!/usr/bin/env python3
"""Build a single, self-contained HTML upload fallback for mobile GitHub Pages.
Models are NOT bundled; pretrained weights still require Internet at runtime."""
from pathlib import Path
import base64
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text()
css=(ROOT/'src/styles.css').read_text()
core=(ROOT/'src/core.mjs').read_text().replace('export ','')
printer=(ROOT/'src/print.mjs').read_text().split('\n',3)[3].replace('export ','')
app=(ROOT/'src/app.mjs').read_text().split('\n',2)[2]
files={
 'assets/sample-coast.jpg':'image/jpeg',
 'assets/sample-depth.png':'image/png',
 'assets/sample-mask.png':'image/png',
 'assets/demo-tactile-preview.png':'image/png',
 'assets/mark.svg':'image/svg+xml',
}
for path,mime in files.items():
    data=f'data:{mime};base64,'+base64.b64encode((ROOT/path).read_bytes()).decode()
    html=html.replace(path,data)
    app=app.replace(path,data)
    css=css.replace(path,data)
html=html.replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+css+'</style>')
html=html.replace('<script type="module" src="src/app.mjs"></script>', '<script type="module">\n'+core+'\n'+printer+'\n'+app+'\n</script>')
assert 'src/app.mjs' not in html
out=ROOT/'one-file-upload'/'index.html';out.parent.mkdir(exist_ok=True)
out.write_text(html)
print('Single HTML generated:',out,'bytes=',out.stat().st_size)
