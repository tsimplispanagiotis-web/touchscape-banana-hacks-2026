import test from 'node:test';
import assert from 'node:assert/strict';
import {W,H,contours,pointsToPath,escapeXml,normalizeDepth,resampleImageData,makeMasksFromIds,extractSemanticStats,buildArtwork,getBraille,colorLayersFromImageData,denoiseMask} from '../src/core.mjs';

test('pixel resampling preserves spatial grid',()=>{
 const img=new Uint8Array([1,2,3,4]);
 assert.deepEqual(Array.from(resampleImageData(img,2,2,1,2,2)),[1,2,3,4]);
});
test('depth normalization clamps and survives constant inputs',()=>{
 const a=normalizeDepth(new Uint8Array([10,20,30]));
 assert.equal(a[0],0);assert.equal(a[2],1);
 const b=normalizeDepth(new Uint8Array([7,7,7]));
 assert.ok(b.every(x=>x===0));
});
test('marching squares traces a closed shape as a simplified contour',()=>{
 const w=40,h=40,f=new Float32Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)f[y*w+x]=(x>8&&x<31&&y>8&&y<31)?1:0;
 const paths=contours(f,w,h,.5);
 assert.ok(paths.length>0);
 assert.ok(paths.some(p=>p.length>=5));
 assert.ok(pointsToPath(paths[0]).startsWith('M'));
});
test('semantic layer scoring and proper escaping',()=>{
 const ids=new Uint8Array(W*H);ids.fill(1);ids[0]=2;
 const layers=makeMasksFromIds(ids,[{id:1,name:'Water'},{id:2,name:'Bird'}]);
 const result=extractSemanticStats(layers);
 assert.equal(result.length,1);assert.equal(result[0].name,'Water');
 assert.equal(escapeXml('<evil &"/>'),'&lt;evil &amp;&quot;/&gt;');
});
test('SVG exports valid document, faithful title and semantic shapes',()=>{
 const depth=new Float32Array(W*H),mask=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x;depth[i]=y/H;
  if(x>25&&x<115&&y>20&&y<90)mask[i]=255;
 }
 const art=buildArtwork({depth,layers:[{name:'<Sailboat>',mask,color:'#eeaa99'}],title:'Sea & Land',detail:5});
 assert.ok(art.svg.startsWith('<svg'));assert.ok(art.svg.includes('Sea &amp; Land'));
 assert.ok(art.svg.includes('&lt;Sailboat&gt;'));assert.ok(art.stats.contours>=4);
 assert.ok(art.stats.regions===1);assert.ok(art.svg.includes('RAISED-LINE DRAFT'));
});
test('simple English letter braille mapping',()=>{assert.equal(getBraille('cat'),'⠉⠁⠞')});

test('color quantization fallback produces labelled, non-neural spatial layers',()=>{
 const data=new Uint8ClampedArray(W*H*4);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const j=(y*W+x)*4;if(x<W/2){data[j]=35;data[j+1]=132;data[j+2]=206;}
  else {data[j]=217;data[j+1]=160;data[j+2]=89;} data[j+3]=255;
 }
 const layers=colorLayersFromImageData({data,width:W,height:H},{count:4});
 assert.ok(layers.length>=2);
 assert.ok(layers.every(l=>l.mask.length===W*H && l.name.startsWith('Color region')));
 const art=buildArtwork({depth:new Float32Array(W*H),layers,provenance:'non-neural preview'});
 assert.match(art.svg,/Source: non-neural preview/);
 assert.equal(art.stats.regions,layers.length);
});
test('mask denoising drops an isolated dot without mutating input',()=>{
 const mask=new Uint8Array(25);mask[12]=255;
 const out=denoiseMask(mask,5,5,1);
 assert.equal(out[12],0);assert.equal(mask[12],255);
});
test('changing region selection changes SVG contour and legend contents',()=>{
 const depth=Float32Array.from({length:W*H},(_,i)=>Math.floor(i/W)/H);
 const ids=Uint8Array.from({length:W*H},(_,i)=>i%W<W/2?1:2);
 const layers=makeMasksFromIds(ids,[{id:1,name:'Left'},{id:2,name:'Right'}]);
 const only=buildArtwork({depth,layers,selected:['Left']});
 const all=buildArtwork({depth,layers});
 assert.equal(only.stats.regions,1);assert.equal(all.stats.regions,2);
 assert.ok(!only.svg.includes('>Right</text>'));
});
test('SVG does not leak unsafe title text as markup',()=>{
 const art=buildArtwork({depth:new Float32Array(W*H),layers:[],title:'<script>alert(1)</script>'});
 assert.ok(!art.svg.includes('<script>'));assert.ok(art.svg.includes('&lt;script&gt;'));
});
