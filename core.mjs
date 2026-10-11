/* Touchscape — deterministic, dependency-free vectorization kernel.
   MIT. SVG artwork is derived from image depth and segmentation, never faked AI output. */

export const W = 168, H = 109;
const EDGES = {
  1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],5:[[3,2],[0,1]],6:[[0,2]],7:[[3,2]],
  8:[[2,3]],9:[[0,2]],10:[[0,3],[1,2]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]]
};
const PALETTE = [
  {name:'Sky', color:'#879aa0', glyph:'⠎'},
  {name:'Sun', color:'#eda45e', glyph:'⠎'},
  {name:'Mountains', color:'#7a8d91', glyph:'⠍'},
  {name:'Sea', color:'#73aaa2', glyph:'⠎'},
  {name:'Cliff', color:'#b39876', glyph:'⠉'},
  {name:'Lighthouse', color:'#dd876b', glyph:'⠇'},
  {name:'Sailboat', color:'#9b94ba', glyph:'⠃'}
];
export const DEMO_LABELS=PALETTE.map((x,i)=>({...x,id:i}));
export const escapeXml = text => String(text).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

export function resampleImageData(data, fromW, fromH, channels=1, outW=W, outH=H) {
  if (![fromW,fromH,channels,outW,outH].every(v=>Number.isInteger(v)&&v>0)) throw new Error('Invalid image dimensions or channels');
  if (data.length < fromW*fromH*channels) throw new Error('Image buffer smaller than declared dimensions');
  const out = new Uint8Array(outW*outH);
  for(let y=0;y<outH;y++) for(let x=0;x<outW;x++) {
    const sx=Math.min(fromW-1,Math.floor((x+.5)*fromW/outW));
    const sy=Math.min(fromH-1,Math.floor((y+.5)*fromH/outH));
    out[y*outW+x]=data[(sy*fromW+sx)*channels];
  }
  return out;
}
export function normalizeDepth(input) {
  const v=Array.from(input).sort((a,b)=>a-b);
  const low=v[Math.floor(v.length*.025)], high=v[Math.floor(v.length*.975)];
  const span=Math.max(1,high-low);
  return Float32Array.from(input,k=>clamp((k-low)/span,0,1));
}
export function blurField(arr,w=W,h=H,passes=1) {
  let current=Float32Array.from(arr);
  for(let k=0;k<passes;k++) {
    const out=new Float32Array(w*h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      let s=0,n=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
        const xx=x+dx, yy=y+dy;
        if(xx>=0&&yy>=0&&xx<w&&yy<h){const weight=(dx===0?2:1)*(dy===0?2:1);s+=current[yy*w+xx]*weight;n+=weight;}
      }
      out[y*w+x]=s/n;
    }
    current=out;
  }
  return current;
}
const eq=(a,b)=>Math.abs(a-b)<.001;
function key(p){return `${Math.round(p[0]*1000)},${Math.round(p[1]*1000)}`;}
function length(points){let sum=0; for(let i=1;i<points.length;i++)sum+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);return sum;}
function simplify(points,eps=0.35){
 if(points.length<3)return points;
 let max=0,pos=0; const a=points[0],b=points[points.length-1];
 for(let i=1;i<points.length-1;i++){
  const p=points[i], ux=b[0]-a[0], uy=b[1]-a[1], ll=ux*ux+uy*uy;
  const t=ll>0?clamp(((p[0]-a[0])*ux+(p[1]-a[1])*uy)/ll,0,1):0;
  const d=Math.hypot(p[0]-(a[0]+t*ux),p[1]-(a[1]+t*uy));
  if(d>max){max=d;pos=i;}
 }
 if(max<=eps)return [a,b];
 const p1=simplify(points.slice(0,pos+1),eps),p2=simplify(points.slice(pos),eps);
 return p1.slice(0,-1).concat(p2);
}
/** Marching squares with path joining, smoothing and short-line suppression.
 *  Input scalar grid is row-major; returns contour polylines in grid-space. */
export function contours(field,w=W,h=H,threshold=.5,{minLength=4,simplification=.34}={}){
 const segments=[];const indexed=new Map();
 const add=(a,b)=>{
  const idx=segments.length;segments.push([a,b]);
  for(const point of [a,b]){const k=key(point);if(!indexed.has(k))indexed.set(k,[]);indexed.get(k).push(idx);}
 };
 for(let y=0;y<h-1;y++)for(let x=0;x<w-1;x++){
  const p=[field[y*w+x],field[y*w+x+1],field[(y+1)*w+x+1],field[(y+1)*w+x]];
  const state=p.reduce((v,z,i)=>v | (z>=threshold?(1<<i):0),0);
  if(state===0||state===15)continue;
  const get=(edge)=>{
   let a,b,ax,ay,bx,by;
   if(edge===0){a=0;b=1;ax=x;ay=y;bx=x+1;by=y;}
   else if(edge===1){a=1;b=2;ax=x+1;ay=y;bx=x+1;by=y+1;}
   else if(edge===2){a=3;b=2;ax=x;ay=y+1;bx=x+1;by=y+1;}
   else {a=0;b=3;ax=x;ay=y;bx=x;by=y+1;}
   const denom=p[b]-p[a],t=Math.abs(denom)<1e-7?.5:clamp((threshold-p[a])/denom,0,1);
   return [ax+(bx-ax)*t,ay+(by-ay)*t];
  };
  for(const [e1,e2] of EDGES[state]||[])add(get(e1),get(e2));
 }
 const done=new Uint8Array(segments.length),chains=[];
 function extend(chain,atStart){
  for(let limit=0;limit<segments.length;limit++){
   const end=atStart?chain[0]:chain[chain.length-1];
   const next=(indexed.get(key(end))||[]).find(i=>!done[i]);
   if(next===undefined)break;
   done[next]=1;const [a,b]=segments[next];
   const other=key(a)===key(end)?b:a;
   if(atStart)chain.unshift(other);else chain.push(other);
   if(chain.length>2&&key(chain[0])===key(chain[chain.length-1]))break;
  }
 }
 for(let i=0;i<segments.length;i++){
  if(done[i])continue;done[i]=1;const chain=[...segments[i]];
  extend(chain,false);extend(chain,true);
  if(length(chain)>=minLength)chains.push(simplify(chain,simplification));
 }
 return chains;
}
export function pointsToPath(points, {x=0,y=0,scaleX=1,scaleY=1}={}){
 if(!points.length)return '';
 return points.map((p,i)=>`${i?'L':'M'}${(x+p[0]*scaleX).toFixed(1)} ${(y+p[1]*scaleY).toFixed(1)}`).join(' ');
}
export function makeMasksFromIds(ids,labels,w=W,h=H){
 return labels.map(label=>({ ...label, mask:Uint8Array.from(ids,v=>v===label.id?255:0) }));
}
export function extractSemanticStats(layers,w=W,h=H){
 return layers.map(x=>{
  let sx=0,sy=0,n=0,xmin=w,ymin=h,xmax=0,ymax=0;
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){
    if(x.mask[y*w+i]>127){sx+=i;sy+=y;n++;xmin=Math.min(xmin,i);xmax=Math.max(xmax,i);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
  }
  return {...x,area:n/(w*h),cx:n?sx/n:w/2,cy:n?sy/n:h/2,bounds:n?[xmin,ymin,xmax,ymax]:null};
 }).filter(x=>x.area>.0015).sort((a,b)=>b.area-a.area);
}
/** Small, deterministic non-neural fallback for immediate previews.
 * Quantizes color plus spatial position, so the user has editable regions
 * without claiming that they came from an image AI model. */
export function colorLayersFromImageData(image, {count=5, minShare=.025}={}) {
 const {data,width,height}=image;
 if(!data||width!==W||height!==H||data.length<W*H*4)throw new Error('Expected aligned RGBA image data');
 const n=W*H, k=clamp(Math.floor(count),2,8), points=new Float32Array(n*5), centers=[];
 for(let i=0;i<n;i++){
  const j=i*4,p=i*5;
  points[p]=data[j];points[p+1]=data[j+1];points[p+2]=data[j+2];
  points[p+3]=(i%W)/(W-1)*115;points[p+4]=Math.floor(i/W)/(H-1)*115;
 }
 // Deterministic farthest-point initialization, not random k-means.
 centers.push(Array.from(points.slice(Math.floor(n*.5)*5,Math.floor(n*.5)*5+5)));
 for(let t=1;t<k;t++){
  let best=-1,bestD=-1;
  for(let i=0;i<n;i+=7){
   let d=Infinity;for(const c of centers){let q=0;for(let v=0;v<5;v++)q+=(points[i*5+v]-c[v])**2;d=Math.min(d,q);}
   if(d>bestD){bestD=d;best=i;}
  }
  centers.push(Array.from(points.slice(best*5,best*5+5)));
 }
 const ids=new Uint8Array(n);
 for(let pass=0;pass<9;pass++){
  const sums=Array.from({length:k},()=>[0,0,0,0,0,0]);
  for(let i=0;i<n;i++){
   const p=i*5;let chosen=0,best=Infinity;
   for(let c=0;c<k;c++){
    let d=0;for(let v=0;v<5;v++)d+=(points[p+v]-centers[c][v])**2;
    if(d<best){best=d;chosen=c;}
   }
   ids[i]=chosen;for(let v=0;v<5;v++)sums[chosen][v]+=points[p+v];sums[chosen][5]++;
  }
  for(let c=0;c<k;c++)if(sums[c][5])for(let v=0;v<5;v++)centers[c][v]=sums[c][v]/sums[c][5];
 }
 const result=[];
 for(let i=0;i<k;i++){
  const mask=Uint8Array.from(ids,v=>v===i?255:0);
  const filtered=denoiseMask(mask,W,H,1);
  let hits=0;for(const x of filtered)if(x>127)hits++;
  if(hits/n<minShare)continue;
  const rgb=centers[i].slice(0,3).map(x=>clamp(Math.round(x),0,255).toString(16).padStart(2,'0')).join('');
  result.push({name:`Color region ${result.length+1}`,mask:filtered,color:`#${rgb}`,id:i});
 }
 return result;
}

/** Suppress isolated mask speckles without blurring all object boundaries. */
export function denoiseMask(mask,w=W,h=H,passes=1){
 if(mask.length!==w*h)throw new Error('Mask dimensions do not match image grid');
 let src=mask;
 for(let pass=0;pass<passes;pass++){
  const dst=new Uint8Array(src.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let votes=0,n=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const xx=x+dx,yy=y+dy;
    if(xx<0||xx>=w||yy<0||yy>=h)continue;
    votes+=src[yy*w+xx]>127?1:0;n++;
   }
   dst[y*w+x]=votes*2>=n?255:0;
  }
  src=dst;
 }
 return src;
}

export function averageBrightness(rgb,width,height){
 let avg=0,second=0,n=0;const step=Math.max(1,Math.floor((width*height)/6000));
 for(let i=0;i<width*height;i+=step){let p=i*4;let lum=.2126*rgb[p]+.7152*rgb[p+1]+.0722*rgb[p+2];avg+=lum;second+=lum*lum;n++;}
 avg/=n;return {mean:avg,contrast:Math.sqrt(Math.max(0,second/n-avg*avg))};
}
export function getBraille(text){
 const map=['⠁','⠃','⠉','⠙','⠑','⠋','⠛','⠓','⠊','⠚','⠅','⠇','⠍','⠝','⠕','⠏','⠟','⠗','⠎','⠞','⠥','⠧','⠺','⠭','⠽','⠵'];
 return String(text).toLowerCase().replace(/[a-z]/g,c=>map[c.charCodeAt(0)-97]);
}
export function buildArtwork({depth,layers,title='Untitled scene',mode='hybrid',detail=6,texture=true,labels=true,invert=false,selected=null,provenance='unverified'} ){
 if(depth.length!==W*H)throw new Error('Incorrect depth buffer size');
 if(!['hybrid','semantic','relief'].includes(mode))throw new Error('Invalid vector mode');
 detail=clamp(Math.round(Number(detail)||6),1,10);
 const plot={x:58,y:170,w:1005,h:656},sx=plot.w/(W-1),sy=plot.h/(H-1);
 const paper='#faf6eb', ink='#23313d', muted='#71818b';
 const visible=(layers||[]).filter(l=>l.mask.length===W*H && (!selected||selected.includes(l.name)));
 const sorted=extractSemanticStats(visible);
 const MAX_VECTOR_PATHS=2500,MAX_TEXTURE_MARKS=1800;
 let nContours=0,nPaths=0,nMarks=0,pathBudgetHit=false,textureBudgetHit=false;
 let body=`<rect width="1540" height="970" fill="${paper}"/>`;
 body+=`<g fill="none" stroke="${ink}" opacity=".15" stroke-width="1.5"><rect x="39" y="146" width="1045" height="699" rx="7"/></g>`;
 body+=`<text x="58" y="65" fill="${ink}" font-family="Arial,sans-serif" font-size="40" font-weight="800" letter-spacing="-1">TOUCHSCAPE</text>`;
 body+=`<text x="59" y="99" fill="${muted}" font-family="Arial,sans-serif" font-size="15">IMAGE → TACTILE SCENE • EXPERIMENTAL RAISED-LINE STUDY</text>`;
 body+=`<text x="1057" y="107" text-anchor="end" fill="${ink}" font-size="24" font-family="Arial,sans-serif" font-weight="700">${escapeXml(title.slice(0,44))}</text>`;
 body+=`<rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="#fffdfa"/>`;
 const smoothed=blurField(depth,W,H,Math.max(0,Math.floor((9-detail)/3)));
 let iso='';
 if(mode!=='semantic'){
  const bands=Math.round(2+detail*1.7);
  const thresholds=Array.from({length:bands},(_,i)=>(i+1)/(bands+1));
  for(const thresh of thresholds){
   if(nPaths>=MAX_VECTOR_PATHS){pathBudgetHit=true;break;}
   const chains=contours(smoothed,W,H,invert?1-thresh:thresh,{minLength:Math.max(5,13-detail),simplification:Math.max(.20,1.45-detail*.10)});
   for(const line of chains){
    if(nPaths>=MAX_VECTOR_PATHS){pathBudgetHit=true;break;}
    if(line.length<2)continue;
    iso+=`<path d="${pointsToPath(line,{x:plot.x,y:plot.y,scaleX:sx,scaleY:sy})}"/>`;
    nContours++;nPaths++;
   }
  }
  body+=`<g fill="none" stroke="#718187" opacity="${mode==='hybrid'?.43:.86}" stroke-linejoin="round" stroke-linecap="round" stroke-width="${mode==='hybrid'?1.6:2.2}">${iso}</g>`;
 }
 let sem='';
 if(mode!=='relief'){
  sorted.forEach((layer,i)=>{
   const paths=contours(layer.mask,W,H,127,{minLength:7,simplification:.38});
   for(const line of paths){
    if(nPaths>=MAX_VECTOR_PATHS){pathBudgetHit=true;break;}
    sem+=`<path d="${pointsToPath(line,{x:plot.x,y:plot.y,scaleX:sx,scaleY:sy})}"/>`;
    nPaths++;
   }
  });
  body+=`<g fill="none" stroke="${ink}" stroke-width="${mode==='semantic'?3.8:3.4}" stroke-linecap="round" stroke-linejoin="round">${sem}</g>`;
 }
 if(texture && mode!=='relief'){
  const dots=[];
  // Sparse vector textures are disjoint and machine-readable, not a raster filter.
  sorted.forEach((layer,i)=>{
   const step= i%2 ? 10:13;
   const type=i%3;
   for(let y=step;y<H-step;y+=step)for(let x=step;x<W-step;x+=step){
    if(layer.mask[y*W+x]<128)continue;
    if(nMarks>=MAX_TEXTURE_MARKS){textureBudgetHit=true;continue;}
    if(type===0)dots.push(`<circle cx="${(plot.x+x*sx).toFixed(1)}" cy="${(plot.y+y*sy).toFixed(1)}" r="2.4"/>`);
    else if(type===1)dots.push(`<path d="M${(plot.x+x*sx-4).toFixed(1)} ${(plot.y+y*sy+3).toFixed(1)} l8 -6"/>`);
    else dots.push(`<path d="M${(plot.x+x*sx-3).toFixed(1)} ${(plot.y+y*sy-3).toFixed(1)} l6 6 m0 -6 l-6 6"/>`);
    nMarks++;
   }
  });
  body+=`<g fill="${ink}" stroke="${ink}" stroke-width="1.1" opacity=".60">${dots.join('')}</g>`;
 }
 if(labels && mode!=='relief'){
  sorted.slice(0,8).forEach((layer,i)=>{
   // Shift labels away from edges and only show meaningful larger regions.
   if(layer.area<.004) return;
   const x=plot.x+clamp(layer.cx,10,W-12)*sx,y=plot.y+clamp(layer.cy,9,H-9)*sy;
   body+=`<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="19" fill="#fffdfa" stroke="${ink}" stroke-width="2.5"/><text x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" text-anchor="middle" fill="${ink}" font-family="Arial,sans-serif" font-size="18" font-weight="700">${i+1}</text></g>`;
  });
 }
 body+=`<g font-family="Arial,sans-serif"><text x="1120" y="179" font-size="17" font-weight="700" fill="${ink}" letter-spacing="2">TACTILE KEY</text><text x="1120" y="210" font-size="13" fill="${muted}">Detected / selected regions</text>`;
 sorted.slice(0,10).forEach((layer,i)=>{
  const y=246+i*58;
  body+=`<rect x="1119" y="${y-17}" width="40" height="40" rx="8" fill="${layer.color||'#94acb1'}" opacity=".18" stroke="${layer.color||ink}"/>`;
  body+=`<text x="1139" y="${y+10}" font-size="17" font-weight="700" text-anchor="middle" fill="${ink}">${i+1}</text>`;
  body+=`<text x="1170" y="${y}" font-size="16" font-weight="700" fill="${ink}">${escapeXml(layer.name.slice(0,28))}</text>`;
  body+=`<text x="1170" y="${y+21}" font-size="17" fill="#73858e">${escapeXml(getBraille(layer.name))}</text>`;
 });
 body+=`<line x1="1117" y1="835" x2="1470" y2="835" stroke="#bfc7c8"/>`;
 body+=`<text x="1118" y="862" fill="${ink}" font-size="15" font-weight="700">READING THE IMAGE</text>`;
 body+=`<text x="1118" y="890" fill="${muted}" font-size="13">Contours = relative visual depth</text>`;
 body+=`<text x="1118" y="911" fill="${muted}" font-size="13">Numbered points = scene regions</text>`;
 body+=`<text x="1118" y="932" fill="${muted}" font-size="12">Review with tactile educators before use.</text>`;
 body+='</g>';
 body+=`<text x="59" y="902" fill="${ink}" font-size="14" font-family="Arial,sans-serif" font-weight="700">RAISED-LINE DRAFT / NOT A CERTIFIED EMBOSSING FILE</text>`;
 body+=`<text x="59" y="928" fill="${muted}" font-size="12" font-family="Arial,sans-serif">Source: ${escapeXml(provenance.slice(0,85))} • Relative depth • Review before fabrication</text>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1540 970" width="1540" height="970" role="img" aria-label="Tactile representation of ${escapeXml(title)}"><title>${escapeXml(title)} – Touchscape</title>${body}</svg>`;
 const warnings=[];
 if(pathBudgetHit)warnings.push('Geometry capped at 2,500 paths to keep exports responsive; lower detail.');
 if(textureBudgetHit)warnings.push('Texture marks capped at 1,800; use fewer regions.');
 if(nPaths>1900)warnings.push('Dense lines: lower detail for touch-readability.');
 if(sorted.length>9)warnings.push('Too many regions: disable small layers to simplify the legend.');
 if(!sorted.length)warnings.push('No semantic layers included: try enabling regions or running AI.');
 return {svg,stats:{contours:nContours,paths:nPaths,textureMarks:nMarks,regions:sorted.length,depthBands:mode==='semantic'?0:Math.round(2+detail*1.7),pathBudgetHit,textureBudgetHit},warnings};
}
