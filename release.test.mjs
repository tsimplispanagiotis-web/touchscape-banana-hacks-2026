import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildArtwork,W,H,denoiseMask} from '../src/core.mjs';
const app=fs.readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('human-in-the-loop controls and review export are present',()=>{
 for(const id of ['simplifyDraft','downloadGuide','downloadReport'])assert.match(html,new RegExp(`id="${id}"`));
 for(const functionName of ['simplifyDraft','exportReviewGuide'])assert.ok(app.includes(`function ${functionName}(`));
 assert.match(app,/humanCorrections:state\.corrections/);
});
test('segmentation cannot advertise dual-model success on empty masks',()=>{
 assert.match(app,/!output\.length/);
 assert.match(app,/!picked\.length/);
});
test('very large filenames and region strings are XML-escaped in SVG',()=>{
 const txt='"/><script>alert(1)</script> &';
 const layer={name:txt,color:'#333333',mask:new Uint8Array(W*H)};
 layer.mask.fill(255);
 const art=buildArtwork({title:txt,depth:new Float32Array(W*H),layers:[layer],detail:2});
 assert.ok(!art.svg.includes('<script>'));
 assert.ok(art.svg.includes('&lt;script&gt;'));
 assert.ok(art.svg.includes('&amp;'));
});
test('binary majority filter keeps solid regions',()=>{
 const mask=new Uint8Array(10*10);mask.fill(255);
 const filtered=denoiseMask(mask,10,10,2);
 assert.equal(filtered.reduce((a,b)=>a+(b===255),0),100);
});
test('path and texture budgets keep extreme noisy samples bounded',()=>{
 const depth=Float32Array.from({length:W*H},(_,i)=>((i*73)%311)/310);
 const mask=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)mask[y*W+x]=(x%2===0&&y%2===0)?255:0;
 const art=buildArtwork({depth,layers:[{name:'Pattern',mask,color:'#223344'}],detail:10,mode:'hybrid'});
 assert.ok(art.stats.paths<=2500);
 assert.ok(art.stats.textureMarks<=1800);
 assert.equal(art.stats.pathBudgetHit,art.stats.paths>=2500);
 assert.ok(art.svg.length<4_000_000);
});
