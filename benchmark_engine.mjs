/** Repeatable, synthetic vectorization-kernel benchmark. Does NOT benchmark AI weights. */
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {W,H,buildArtwork} from '../src/core.mjs';
const cases={
 horizon:(x,y)=>({depth:y/H,mask:y<H*.5}),
 island:(x,y)=>({depth:Math.exp(-((x-85)**2+(y-50)**2)/1800),mask:(x-85)**2+(y-50)**2<1500}),
 checker:(x,y)=>({depth:((x*17+y*31)%97)/96,mask:(x+y)%3===0}),
 folds:(x,y)=>({depth:.5+.45*Math.sin(x*.05)*Math.cos(y*.07),mask:x>35&&y>30})
};
const rows=[];
for(const [name,fn] of Object.entries(cases)){
 const depth=new Float32Array(W*H),mask=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const k=y*W+x,v=fn(x,y);depth[k]=v.depth;mask[k]=v.mask?255:0;
 }
 const input={depth,layers:[{name:'Region',mask,color:'#668899'}],title:name,detail:6};
 const durations=[];let art;
 for(let repeat=0;repeat<7;repeat++){
  const start=performance.now();art=buildArtwork(input);durations.push(performance.now()-start);
 }
 durations.sort((a,b)=>a-b);
 rows.push({scene:name,median_ms:+durations[3].toFixed(1),svg_kib:+(new TextEncoder().encode(art.svg).length/1024).toFixed(1),paths:art.stats.paths,texture_marks:art.stats.textureMarks,svg_sha256:createHash('sha256').update(art.svg).digest('hex')});
}
const output={note:'Local single-thread Node 22, synthetic grids 168×109; vector engine only. NOT model inference, usability, or cross-device performance.',rows};
writeFileSync(new URL('../VECTOR_BENCHMARKS.json',import.meta.url),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
