import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');

test('all direct DOM references resolve to declared element IDs',()=>{
 const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(a=>a[1]));
 const referenced=new Set([...js.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(a=>a[1]));
 for(const id of referenced)assert.ok(ids.has(id),`Missing element id=${id}`);
});
test('model labels and demo labeling are explicit',()=>{
 assert.ok(html.includes('ILLUSTRATIVE SAMPLE'));
 assert.ok(js.includes("state.sample?'ILLUSTRATIVE SAMPLE'"));
 assert.ok(html.includes('NOT A CERTIFIED EMBOSSING FILE')||html.includes('not validated tactile graphics'));
});
