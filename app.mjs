import {W,H,DEMO_LABELS,resampleImageData,normalizeDepth,makeMasksFromIds,extractSemanticStats,buildArtwork,getBraille,clamp,colorLayersFromImageData,denoiseMask} from './core.mjs';
import {buildPrintSheet} from './print.mjs';

const $=id=>document.getElementById(id);
const state={
  depth:new Float32Array(W*H),layers:[],originalUrl:'assets/sample-coast.jpg',title:'Coastline study',
  sample:true,ai:false,depthAi:false,segAi:false,analyzing:false,offline:false,mode:'hybrid',detail:6,texture:true,numbers:true,
  selected:null,photoDataUrl:null,artwork:null,previewDataUrl:null,sourceW:1000,sourceH:650,corrections:[]
};
let renderSeq=0, renderTimer=null, toastTimer=null, sceneEpoch=0;
const logger=(msg,type='info')=>{
  $('statusBox').classList.toggle('error',type==='error');
  $('statusText').textContent=msg;
};
function toast(msg){clearTimeout(toastTimer);$('toast').textContent=msg;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3900);}
const loadImage=(url)=>new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=()=>rej(new Error('Could not read image '+url));img.src=url;});
function getGrid(url){return loadImage(url).then(img=>{const c=document.createElement('canvas');c.width=W;c.height=H;const cx=c.getContext('2d',{willReadFrequently:true});cx.imageSmoothingEnabled=false;cx.drawImage(img,0,0,W,H);return cx.getImageData(0,0,W,H);});}
function fileToDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('File reader failed'));r.readAsDataURL(file);});}
async function setDemo(){
  const epoch=++sceneEpoch;
  state.title='Coastline study';state.originalUrl='assets/sample-coast.jpg';state.photoDataUrl=null;
  const [d,m]=await Promise.all([getGrid('assets/sample-depth.png'),getGrid('assets/sample-mask.png')]);
  if(epoch!==sceneEpoch)return;
  const rawD=new Uint8Array(W*H),ids=new Uint8Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const k=y*W+x;rawD[k]=clamp(d.data[k*4]+Math.round((y/H)*12+8*Math.sin(x/34)*Math.cos(y/17)),0,255);
    ids[k]=m.data[k*4];
  }
  state.depth=normalizeDepth(rawD);state.layers=makeMasksFromIds(ids,DEMO_LABELS);
  state.sample=true;state.ai=false;state.depthAi=false;state.segAi=false;state.offline=false;state.selected=null;state.corrections=[];state.artwork=null;state.previewDataUrl=null;state.sourceW=1000;state.sourceH=650;
  $('sourceImage').src=state.originalUrl;
  $('sceneDesc').textContent='A lighthouse above the water. Layered hills, a setting sun and a sailboat become shapes you can follow.';
  ['depthStatus','segmentStatus'].forEach(id=>{$(id).textContent='NOT RUN';$(id).className='model-state'});
  logger('Illustrative sample loaded. Run AI for a real inference.');
  updateUi();queueRender();
}
function makeSimplePreview(imgData){
  const d=new Uint8Array(W*H);const raw=imgData.data;
  // A clearly labelled, NON-ML fallback that allows a draft before the large model downloads.
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=(y*W+x)*4;
    d[y*W+x]=Math.round((.2126*raw[i]+.7152*raw[i+1]+.0722*raw[i+2])*.60+(y/H)*90);
  }
  return normalizeDepth(d);
}
async function uploadFile(file){
 if(!file)return;
 const epoch=++sceneEpoch;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast('Please choose a JPG, PNG, or WebP image.');return;}
 if(file.size>14*1024*1024){toast('Use an image under 14 MB.');return;}
 try{
  const url=await fileToDataURL(file),img=await loadImage(url);
  if(img.width*img.height>32000000||Math.max(img.width,img.height)>12000)throw new Error('Image dimensions too large; use an image under 32 megapixels.');
  const c=document.createElement('canvas');c.width=1000;c.height=650;
  // Letterbox, never stretch: both original view and machine masks now share a spatial frame.
  const ctx=c.getContext('2d');ctx.fillStyle='#faf6eb';ctx.fillRect(0,0,c.width,c.height);
  const scale=Math.min(c.width/img.width,c.height/img.height);
  const dw=img.width*scale,dh=img.height*scale;
  ctx.drawImage(img,(c.width-dw)/2,(c.height-dh)/2,dw,dh);
  const framedURL=c.toDataURL('image/jpeg',.88);
  const newTitle=file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').slice(0,50)||'Uploaded scene';
  const original=await getGrid(framedURL);
  if(epoch!==sceneEpoch)return;
  state.photoDataUrl=framedURL;state.originalUrl=framedURL;state.sourceW=c.width;state.sourceH=c.height;state.title=newTitle;
  state.depth=makeSimplePreview(original);state.layers=colorLayersFromImageData(original);state.selected=null;
  state.sample=false;state.ai=false;state.depthAi=false;state.segAi=false;state.offline=true;state.corrections=[];state.artwork=null;state.previewDataUrl=null;
  $('sourceImage').src=state.originalUrl;
  $('sceneDesc').textContent='Color regions and luminance contours are available as a non-AI draft. Run both neural models for semantic labels and learned depth.';
  ['depthStatus','segmentStatus'].forEach(id=>{$(id).textContent='NOT RUN';$(id).className='model-state'});
  logger('Instant, non-neural color/depth preview ready. Run real AI to improve scene understanding.');
  updateUi();queueRender();
 }catch(e){toast('Image import failed: '+e.message)}
}
function updateUi(){
  $('canvasTitle').textContent=state.title;
  $('sceneTitle').textContent=state.title;
  $('canvasbar').textContent='/ '+(state.title).toUpperCase().slice(0,25);
  $('inferBadge').textContent=state.ai?'DUAL-MODEL AI':state.depthAi?'PARTIAL • DEPTH AI':state.segAi?'PARTIAL • SEGMENTATION AI':state.sample?'ILLUSTRATIVE SAMPLE':'OFFLINE • NON-AI';
  $('inferBadge').classList.toggle('inferred',state.ai||state.depthAi||state.segAi);
  const stats=extractSemanticStats(state.layers).sort((a,b)=>b.area-a.area);
  const list=$('regionList');list.replaceChildren();
  const selected=state.selected||state.layers.map(x=>x.name);
  for(let i=0;i<stats.length;i++){
    const region=stats[i],row=document.createElement('div');row.className='region';
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=selected.includes(region.name);
    checkbox.setAttribute('aria-label',`Include ${region.name} in tactile translation`);
    checkbox.addEventListener('change',()=>{
      if(state.selected===null)state.selected=state.layers.map(l=>l.name);
      state.selected=checkbox.checked?Array.from(new Set([...state.selected,region.name])):state.selected.filter(s=>s!==region.name);
      queueRender();
    });
    const chip=document.createElement('span');chip.className='region-symbol';chip.style.background=region.color?region.color+'30':'#293b45';chip.style.color=region.color||'#a6c8c5';chip.textContent=String(i+1);
    const txt=document.createElement('span');txt.className='region-text';const b=document.createElement('b');b.textContent=region.name;const small=document.createElement('small');small.textContent=getBraille(region.name);txt.append(b,small);
    const share=document.createElement('span');share.className='region-share';share.textContent=Math.round(region.area*100)+'%';
    const rename=document.createElement('button');rename.type='button';rename.className='rename-region';rename.textContent='✎';
    rename.title='Correct this automatically detected label';rename.setAttribute('aria-label',`Rename region ${region.name}`);
    rename.addEventListener('click',()=>{
      const old=region.name;const answer=window.prompt('Correct region label (verified against your image):',old);
      if(answer===null)return;
      const next=answer.trim().replace(/\s+/g,' ').slice(0,32);
      if(!next||next===old)return;
      if(state.layers.some(layer=>layer.name.toLowerCase()===next.toLowerCase())){toast('Use a unique region name.');return;}
      state.layers.find(layer=>layer.name===old).name=next;
      if(state.selected!==null)state.selected=state.selected.map(name=>name===old?next:name);
      state.corrections.push({from:old,to:next});
      updateUi();queueRender();toast('Human correction recorded in the analysis manifest.');
    });
    row.append(checkbox,chip,txt,share,rename);list.append(row);
  }
  $('layerCount').textContent=`${stats.length} ${stats.length===1?'LAYER':'LAYERS'}`;
  $('downloadSVG').disabled=!state.artwork;
  $('downloadPNG').disabled=!state.previewDataUrl;
  $('narrate').disabled=!state.layers.length;$('downloadReport').disabled=!state.artwork;$('downloadGuide').disabled=!state.artwork;$('downloadPrint').disabled=!state.artwork;
  if(!stats.length)list.innerHTML='<div style="padding:23px;color:#8697a4;font-size:11px;line-height:1.7">No scene regions yet. Run vision analysis to discover objects and material boundaries.</div>';
}
function queueRender(){clearTimeout(renderTimer);renderTimer=setTimeout(render,80);}
async function previewCropped(svg){
  const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);
  try{
   const img=await loadImage(url);
   const c=document.createElement('canvas');c.width=1000;c.height=650;
   const ctx=c.getContext('2d');ctx.fillStyle='#faf6eb';ctx.fillRect(0,0,c.width,c.height);
   // source crop to the main art panel; full SVG export retains its complete legend.
   ctx.drawImage(img,58,170,1005,656,0,0,1000,650);
   return c.toDataURL('image/png');
  }finally{URL.revokeObjectURL(url)}
}
async function render(){
  const seq=++renderSeq;
  try{
    const art=buildArtwork({depth:state.depth,layers:state.layers,title:state.title,mode:state.mode,detail:state.detail,texture:state.texture,labels:state.numbers,selected:state.selected,provenance:state.ai?'dual-model neural vision':state.depthAi?'neural depth; non-neural region source':state.segAi?'neural segmentation; non-neural depth source':state.sample?'illustrative authored sample':'non-neural color and luminance preview'});
    const preview=await previewCropped(art.svg);
    if(seq!==renderSeq)return;
    state.artwork=art;state.previewDataUrl=preview;
    updateExportButtons();
    const pic=new Image();pic.alt='Vector tactile translation of '+state.title;
    pic.className='tactile-preview';pic.src=preview;
    $('renderedArt').replaceChildren(pic);
    const hero=$('heroArt');const himg=hero.querySelector('img');if(himg){himg.src=preview;himg.alt='Current scene translated as a tactile-inspired vector draft';himg.style.filter='none';}
    const stats=art.stats;
    // A deterministic visual-density indicator, NOT a readability assessment.
    const score=clamp(Math.round(100-Math.max(0,stats.paths-110)*.055-Math.max(0,stats.textureMarks-140)*.06-Math.max(0,stats.regions-5)*7),5,100);
    $('qualityValue').textContent=stats.paths+' paths';$('qualityFill').style.width=score+'%';
    const warning=art.warnings[0];
    const density=stats.paths>900||stats.textureMarks>900?'HIGH':stats.paths>450||stats.textureMarks>400?'MODERATE':'LOW';
    $('qualityMessage').textContent=(warning?warning+' · ':'')+`${density} visual density · ${stats.depthBands} levels · ${stats.regions} regions · ${stats.textureMarks} texture marks. Not a tactile readability score.`;
  }catch(err){console.error(err);logger('Could not render scene: '+err.message,'error');}
}
function updateExportButtons(){
 $('downloadSVG').disabled=!state.artwork;
 $('downloadPNG').disabled=!state.previewDataUrl;
 $('downloadReport').disabled=!state.artwork;$('downloadGuide').disabled=!state.artwork;$('downloadPrint').disabled=!state.artwork;
 $('narrate').disabled=!state.layers.length;
}
function checkScene(epoch){
 if(epoch!==sceneEpoch)throw new DOMException('Scene changed during analysis','AbortError');
}
function progressStatus(label){
 let last=0;
 return evt=>{
  if(!evt||evt.status!=='progress'||!evt.total||!evt.loaded)return;
  const pct=Math.round(evt.loaded/evt.total*100),now=Date.now();
  if(now-last<450 && pct<100)return;last=now;
  logger(`${label}: downloading model assets (${pct}%). First run needs internet; images remain on-device.`);
 };
}
async function runAI(){
 if(state.analyzing)return;
 const epoch=sceneEpoch;
 state.analyzing=true;
 const initial={sample:state.sample,offline:state.offline};
 let segAi=false,depthAi=false,semanticLayers=null,inferredDepth=null,segmenter=null,estimator=null;
 let segError=null,depthError=null;
 $('analyzeButton').disabled=true;
 const setModel=(id,status,kind)=>{const el=$(id);el.textContent=status;el.className='model-state'+(kind?' '+kind:'');};
 // The compact SegFormer runs first: the reviewer can inspect a real neural result
 // before the larger depth model has completed its initial network download.
 setModel('segmentStatus','LOADING','running');setModel('depthStatus','QUEUED','');
 try{
  logger('Preparing on-device Image AI. Semantic segmentation runs first for faster first results.');
  let library;
  try{library=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0');}
  catch(e){library=await import('https://esm.sh/@huggingface/transformers@3.7.6');}
  const {pipeline}=library;
  if(typeof pipeline!=='function')throw new Error('Transformers.js did not export a working inference pipeline');
  checkScene(epoch);
  const src=state.photoDataUrl||new URL('assets/sample-coast.jpg',location.href).href;
  try{
   segmenter=await pipeline('image-segmentation','Xenova/segformer-b0-finetuned-ade-512-512',{device:'wasm',progress_callback:progressStatus('SegFormer')});
   checkScene(epoch);setModel('segmentStatus','RUNNING','running');
   const output=await segmenter(src);checkScene(epoch);
   if(!Array.isArray(output)||!output.length)throw new Error('SegFormer did not return masks');
   const picked=[],colors=['#b4e1b8','#ccb5e5','#e4b782','#a6cdd5','#dfa3ad','#9cbd9d','#b4a6df','#d9ae95','#99bdba'],used=new Map();
   for(let i=0;i<output.length;i++){
    const item=output[i],rawMask=item.mask;
    if(!rawMask?.data||!rawMask.width||!rawMask.height)continue;
    const mask=resampleImageData(rawMask.data,rawMask.width,rawMask.height,rawMask.channels||1,W,H);
    const cleaned=denoiseMask(mask,W,H,1);
    let count=0;for(const v of cleaned)if(v>127)count++;
    if(count/(W*H)<.006)continue;
    const base=String(item.label||'Region '+(i+1)).replace(/\b\w/g,c=>c.toUpperCase()).slice(0,28);
    const ordinal=(used.get(base)||0)+1;used.set(base,ordinal);
    picked.push({name:ordinal===1?base:`${base} ${ordinal}`,mask:cleaned,color:colors[i%colors.length],id:i,area:count});
   }
   if(!picked.length)throw new Error('No substantial semantic masks were returned');
   picked.sort((a,b)=>b.area-a.area);
   semanticLayers=picked.slice(0,9);
   segAi=true;state.layers=semanticLayers;state.segAi=true;state.depthAi=false;state.ai=false;state.selected=null;state.corrections=[];
   state.sample=initial.sample;state.offline=initial.offline;
   setModel('segmentStatus','DONE','done');
   $('sceneDesc').textContent='Neural semantic masks are ready. Depth Anything is loading; review the region labels while you wait.';
   updateUi();queueRender();
   logger(`First AI result ready: ${semanticLayers.length} semantic regions. Loading depth model next…`);
  }catch(err){
   if(err.name==='AbortError')throw err;
   segError=err;setModel('segmentStatus','FAILED','');
   console.warn('SegFormer did not complete',err);
  }finally{if(segmenter?.dispose)try{await segmenter.dispose()}catch{};segmenter=null;}
  checkScene(epoch);
  setModel('depthStatus','LOADING','running');
  try{
   logger(segAi?'Semantic AI succeeded. Depth Anything is now downloading / estimating relative depth…':'Semantic model unavailable. Trying neural depth independently…');
   estimator=await pipeline('depth-estimation','Xenova/depth-anything-small-hf',{device:'wasm',progress_callback:progressStatus('Depth Anything')});
   checkScene(epoch);setModel('depthStatus','RUNNING','running');
   const result=await estimator(src);checkScene(epoch);
   const raw=result?.depth;
   if(!raw?.data||!raw.width||!raw.height)throw new Error('Depth Anything returned no depth raster.');
   inferredDepth=normalizeDepth(resampleImageData(raw.data,raw.width,raw.height,raw.channels||1,W,H));
   depthAi=true;state.depth=inferredDepth;state.depthAi=true;state.ai=segAi;
   state.sample=initial.sample;state.offline=initial.offline;
   setModel('depthStatus','DONE','done');
  }catch(err){
   if(err.name==='AbortError')throw err;
   depthError=err;setModel('depthStatus','FAILED','');
   console.warn('Depth Anything did not complete',err);
  }finally{if(estimator?.dispose)try{await estimator.dispose()}catch{};estimator=null;}
  checkScene(epoch);
  if(!segAi&&!depthAi)throw new Error(`Both neural models failed. Segmentation: ${segError?.message||'unknown'}; depth: ${depthError?.message||'unknown'}.`);
  if(segAi&&depthAi){
   state.ai=true;state.sample=false;state.offline=false;
   $('sceneDesc').textContent='Two neural models inferred semantic regions and relative depth. Labels and contours require human review.';
   logger(`Dual-model analysis completed. ${semanticLayers.length} neural regions. Review before exporting.`);
   toast('Dual-model vision is ready ✳');
  }else if(segAi){
   $('sceneDesc').textContent='Partial AI: semantic labels are neural; depth lines come from the prior illustrative or non-neural estimate.';
   logger('Partial AI: semantic model succeeded, depth model unavailable. '+(depthError?.message||''),'error');
   toast('Semantic AI available; depth estimation incomplete.');
  }else{
   state.depthAi=true;state.ai=false;state.sample=initial.sample;state.offline=initial.offline;
   $('sceneDesc').textContent='Partial AI: depth is neural; region labels remain illustrative or non-neural estimates.';
   logger('Partial AI: neural depth succeeded, semantic model unavailable. '+(segError?.message||''),'error');
   toast('Neural depth available; segmentation incomplete.');
  }
  updateUi();queueRender();
 }catch(err){
  if(err.name==='AbortError'||epoch!==sceneEpoch)return;
  console.error('Touchscape inference unavailable',err);
  logger('Neural inference unavailable. The labelled preview remains usable. '+err.message,'error');
  toast('Neural inference unavailable — preview is still editable.');
  for(const id of ['depthStatus','segmentStatus'])if($(id).classList.contains('running'))setModel(id,'FAILED','');
 }finally{
  if(segmenter?.dispose)try{await segmenter.dispose()}catch{};
  if(estimator?.dispose)try{await estimator.dispose()}catch{};
  state.analyzing=false;$('analyzeButton').disabled=false;
 }
}
function downloadFile(filename,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function exportSVG(){if(!state.artwork){toast('No scene has finished rendering.');return;}const safe=state.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');downloadFile(`touchscape-${safe}.svg`,state.artwork.svg,'image/svg+xml');toast('Editable SVG exported.');}
function exportReport(){
 if(!state.artwork){toast('No scene has finished rendering.');return;}
 const regions=extractSemanticStats(state.layers).map(x=>({name:x.name,fractionOfImage:+x.area.toFixed(4),selected:state.selected===null||state.selected.includes(x.name)}));
 const report={schema:'touchscape.v1',sourceTitle:state.title,inferenceMode:state.ai?'dual-model-neural-inference':state.depthAi?'neural-depth-plus-non-neural-regions':state.segAi?'neural-segmentation-plus-non-neural-depth':state.sample?'authored-demo-ground-truth':'non-neural-color-quantization',modelIds:[...(state.depthAi?['Xenova/depth-anything-small-hf']:[]),...(state.segAi?['Xenova/segformer-b0-finetuned-ade-512-512']:[])],humanCorrections:state.corrections,relativeDepth:true,settings:{mode:state.mode,detail:state.detail,texture:state.texture,labels:state.numbers},vectorStats:state.artwork.stats,regions,limitations:['Not validated for tactile reading','Relative depth is not metric','Semantic labels require human review','Visual Unicode braille is not hardware braille output']};
 downloadFile('touchscape-analysis.json',JSON.stringify(report,null,2),'application/json');toast('Analysis manifest exported.');
}
function exportPrint(){
 if(!state.artwork){toast('Finish the current scene before exporting.');return;}
 const provenance=state.ai?'dual-model neural inference':state.depthAi?'learned depth only':state.segAi?'neural segmentation only':state.sample?'illustrative authored sample':'non-neural preview';
 try{
  const sheet=buildPrintSheet({depth:state.depth,layers:state.layers,title:state.title,selected:state.selected,detail:state.detail,provenance});
  const safe=state.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'scene';
  downloadFile(`touchscape-${safe}-a4-print-lab.svg`,sheet.svg,'image/svg+xml;charset=utf-8');
  logger(`A4 Print Lab: ${sheet.stats.totalPaths} paths, ${sheet.stats.selectedRegions} regions. Real-world tactile validation still required.`);
  toast('Physical-scale A4 SVG exported. Review before any embossing.');
 }catch(e){logger(`A4 sheet unavailable: ${e.message}`,'error');}
}
function exportPNG(){if(!state.previewDataUrl)return;const a=document.createElement('a');a.href=state.previewDataUrl;a.download='touchscape-preview.png';a.click();toast('High-resolution preview exported.');}
function simplifyDraft(){
 const largest=extractSemanticStats(state.layers).slice(0,4);
 if(!largest.length){toast('There are no regions to simplify.');return;}
 state.selected=largest.map(x=>x.name);
 state.mode='hybrid';state.detail=3;state.texture=false;state.numbers=true;
 document.querySelectorAll('[data-mode]').forEach(btn=>{const on=btn.dataset.mode==='hybrid';btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));});
 $('detail').value=String(state.detail);$('detailValue').textContent=state.detail+' / 10';
 $('textures').checked=false;$('numbers').checked=true;
 updateUi();queueRender();toast(`Focused the draft on ${largest.length} major regions. Review before printing.`);
}
function exportReviewGuide(){
 if(!state.artwork){toast('Finish rendering first.');return;}
 const visible=extractSemanticStats(state.layers).filter(x=>state.selected===null||state.selected.includes(x.name));
 const provenance=state.ai?'Both neural models completed':state.depthAi?'Only learned depth completed':state.segAi?'Only neural segmentation completed':state.sample?'Illustrative sample: hand-authored': 'Non-neural color and luminance preview';
 const lines=[
  'TOUCHSCAPE — HUMAN REVIEW HANDOFF',
  `Scene: ${state.title}`,`Provenance: ${provenance}`,
  `Composition: ${state.mode}, detail ${state.detail}/10, textures ${state.texture?'on':'off'}, numbering ${state.numbers?'on':'off'}`,
  `Export complexity: ${state.artwork.stats.paths} vector paths, ${state.artwork.stats.textureMarks} texture marks`,
  '', 'SELECTED REGIONS',...visible.map((x,i)=>`${i+1}. ${x.name} (${Math.round(x.area*100)}% image area)`),
  '', 'MANDATORY HUMAN REVIEW BEFORE TACTILE USE',
  '[ ] Check all semantic labels against original photograph',
  '[ ] Remove confusing overlapping boundaries and decorative detail',
  '[ ] Have a trained tactile graphics specialist check dimensions, line widths, spacing and legend',
  '[ ] Translate labels using correct braille software (Unicode glyphs are NOT embosser instructions)',
  '[ ] Use appropriate embossing/swell-paper fabrication; ordinary printing creates no relief',
  '[ ] Validate with blind/low-vision readers before claiming accessibility',
  '', 'LIMITATIONS',
  '- Prototype vector artwork. Not certified, navigation-safe or medically validated.',
  '- The depth network estimates relative depth, not real physical distances.',
  '- No user testing or empirical readability guarantee is implied.',
  '- Machine output is a starting point, not a ready-to-use accessible diagram.'
 ];
 downloadFile('touchscape-review-guide.txt',lines.join('\n'),'text/plain;charset=utf-8');
 toast('Human-review handoff exported.');
}
function describe(){if(!('speechSynthesis' in window)){toast('Speech synthesis is not available in this browser.');return;}
 const stats=extractSemanticStats(state.layers),names=stats.filter(l=>state.selected===null||state.selected.includes(l.name)).map(l=>l.name);
 window.speechSynthesis.cancel();const msg=`Touchscape study: ${state.title}. This is an automatic scene reading. The prominent regions are ${names.join(', ')||'unclassified shapes'}. The tactile draft uses layered depth contours, numbered points, and a legend. Please verify all labels with the original image.`;
 const utterance=new SpeechSynthesisUtterance(msg);utterance.lang='en-US';utterance.rate=.87;window.speechSynthesis.speak(utterance);
 toast('Reading the scene aloud…');
}
function setCompare(value){$('compare').style.setProperty('--split',value+'%');}
function activateView(only){$('artOnlyButton').classList.toggle('view-active',only);$('compareButton').classList.toggle('view-active',!only);$('artOnlyButton').setAttribute('aria-pressed',String(only));$('compareButton').setAttribute('aria-pressed',String(!only));$('compareSlider').disabled=only;setCompare(only?0:$('compareSlider').value);}
function register(){
 $('photoInput').addEventListener('change',e=>uploadFile(e.target.files[0]));
 $('resetSample').addEventListener('click',setDemo);
 const drop=$('dropzone');
 for(const e of ['dragenter','dragover'])drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('dragging')});
 for(const e of ['dragleave','drop'])drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('dragging')});
 drop.addEventListener('drop',ev=>uploadFile(ev.dataTransfer.files[0]));
 drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('photoInput').click();}});
 $('analyzeButton').addEventListener('click',runAI);
 document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{state.mode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn))});queueRender()}));
 $('detail').addEventListener('input',e=>{state.detail=Number(e.target.value);$('detailValue').textContent=state.detail+' / 10';queueRender()});
 $('textures').addEventListener('change',e=>{state.texture=e.target.checked;queueRender()});
 $('numbers').addEventListener('change',e=>{state.numbers=e.target.checked;queueRender()});
 $('compareSlider').addEventListener('input',e=>setCompare(e.target.value));
 $('artOnlyButton').addEventListener('click',()=>activateView(true));
 $('compareButton').addEventListener('click',()=>activateView(false));
 $('simplifyDraft').addEventListener('click',simplifyDraft);$('downloadGuide').addEventListener('click',exportReviewGuide);$('downloadPrint').addEventListener('click',exportPrint);
 $('downloadSVG').addEventListener('click',exportSVG);$('downloadPNG').addEventListener('click',exportPNG);
 $('narrate').addEventListener('click',describe);$('downloadReport').addEventListener('click',exportReport);
}
register();setDemo().catch(e=>logger('Sample loading failed: '+e.message,'error'));
