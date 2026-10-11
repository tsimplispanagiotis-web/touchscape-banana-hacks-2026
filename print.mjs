/* TOUCHSCAPE Print Lab — conservative, deterministic, physical-size study sheet.
 * Values are geometry specifications only. No tactile usability certification is implied. */
import {W,H,contours,pointsToPath,blurField,extractSemanticStats,escapeXml,clamp} from './core.mjs';

export const PRINT_PROFILE=Object.freeze({page:'A4 landscape',widthMm:297,heightMm:210,minimumBorderMm:12,plotWidthMm:205,plotHeightMm:133,outlineMm:0.65,depthStrokeMm:0.27,maxRegions:5,maxSemanticPaths:230,maxDepthPaths:100});

function centroidCandidate(layer, occupied, plot, profile) {
  const candidates=[];
  if(layer.bounds){const [left,top,right,bottom]=layer.bounds;
    candidates.push([layer.cx,layer.cy]);
    for(const t of [.25,.5,.75])for(const u of [.25,.5,.75])candidates.push([left+(right-left)*t,top+(bottom-top)*u]);
  }
  let best=null,bestScore=-Infinity;
  for(const [gx,gy] of candidates){
    const ix=clamp(Math.round(gx),0,W-1),iy=clamp(Math.round(gy),0,H-1);
    if(layer.mask[iy*W+ix]<128)continue;
    const x=plot.x+(gx/(W-1))*plot.w,y=plot.y+(gy/(H-1))*plot.h;
    const margin=Math.min(x-plot.x,plot.x+plot.w-x,y-plot.y,plot.y+plot.h-y);
    const clearance=occupied.length?Math.min(...occupied.map(p=>Math.hypot(x-p.x,y-p.y))):40;
    const score=Math.min(clearance,35)+Math.min(margin,12)*.35;
    if(score>bestScore){best={x,y};bestScore=score;}
  }
  if(best && occupied.some(p=>Math.hypot(best.x-p.x,best.y-p.y)<9))return null;
  return best;
}

/** Creates an A4 landscape SVG in true millimetres. It is a prototype for specialist review. */
export function buildPrintSheet({depth,layers,title='Image study',selected=null,detail=4,provenance='unverified'}={}) {
  if(!depth || depth.length!==W*H)throw new Error('Aligned depth raster required');
  const p=PRINT_PROFILE,plot={x:13,y:35,w:p.plotWidthMm,h:p.plotHeightMm};
  const picked=extractSemanticStats((layers||[]).filter(l=>l.mask?.length===W*H && (selected===null||selected.includes(l.name))))
    .filter(l=>l.area>.004).slice(0,p.maxRegions);
  const esc=escapeXml;
  const sx=plot.w/(W-1),sy=plot.h/(H-1);
  const content=[];let semanticPaths=0,depthPaths=0,excluded=0;
  content.push(`<rect x="0" y="0" width="297" height="210" fill="white"/>`);
  content.push(`<text x="13" y="15" font-family="Arial,sans-serif" font-weight="700" font-size="8" fill="black">TOUCHSCAPE <tspan font-size="3.3" font-weight="400">/ PRINT LAB</tspan></text>`);
  content.push(`<text x="13" y="23.5" font-family="Arial,sans-serif" font-size="4" fill="#333">${esc(title.slice(0,74))}</text>`);
  content.push(`<rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="none" stroke="black" stroke-width="0.5"/>`);
  const source=blurField(depth,W,H,2);
  const levels=[.28,.47,.66,.83];
  const maxDepth=p.maxDepthPaths;
  for(const lv of levels){
    const polylines=contours(source,W,H,lv,{minLength:Math.max(14,24-detail),simplification:Math.max(.8,1.8-detail*.12)});
    for(const poly of polylines){
      if(depthPaths>=maxDepth){excluded++;break;}
      const d=pointsToPath(poly,{x:plot.x,y:plot.y,scaleX:sx,scaleY:sy});
      content.push(`<path d="${d}" fill="none" stroke="#777" stroke-width="${p.depthStrokeMm}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.2 1.5"/>`);
      depthPaths++;
    }
    if(depthPaths>=maxDepth)break;
  }
  const occupied=[],marks=[];
  for(let i=0;i<picked.length;i++){
    const layer=picked[i],polylines=contours(layer.mask,W,H,127,{minLength:12,simplification:.75});
    for(const poly of polylines){
      if(semanticPaths>=p.maxSemanticPaths){excluded++;break;}
      content.push(`<path d="${pointsToPath(poly,{x:plot.x,y:plot.y,scaleX:sx,scaleY:sy})}" fill="none" stroke="black" stroke-width="${p.outlineMm}" stroke-linecap="round" stroke-linejoin="round"/>`);
      semanticPaths++;
    }
    const pt=centroidCandidate(layer,occupied,plot,p);
    if(pt){occupied.push(pt);marks.push({label:i+1,...pt});}
  }
  for(const m of marks){
    content.push(`<circle cx="${m.x.toFixed(2)}" cy="${m.y.toFixed(2)}" r="3.5" fill="white" stroke="black" stroke-width=".6"/>`);
    content.push(`<text x="${m.x.toFixed(2)}" y="${(m.y+1.55).toFixed(2)}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="4.4">${m.label}</text>`);
  }
  content.push(`<g font-family="Arial,sans-serif" fill="black"><text x="224" y="37" font-size="4.7" font-weight="700">REGION KEY</text>`);
  picked.forEach((r,i)=>{
    const y=47+i*13;
    content.push(`<circle cx="228" cy="${y-1.3}" r="3" fill="white" stroke="black" stroke-width=".5"/>`);
    content.push(`<text x="228" y="${y+.1}" font-size="3.9" font-weight="700" text-anchor="middle">${i+1}</text>`);
    const a=r.name.length>22?r.name.slice(0,21)+'…':r.name;
    content.push(`<text x="235" y="${y}" font-size="3.6">${esc(a)}</text>`);
    content.push(`<text x="235" y="${y+4}" font-size="2.9" fill="#555">${Math.round(r.area*100)}% image</text>`);
  });
  content.push(`<text x="224" y="126" font-size="3.9" font-weight="700">LEGEND</text>`);
  content.push(`<text x="224" y="133" font-size="3.1">Solid: region boundary</text>`);
  content.push(`<text x="224" y="139" font-size="3.1">Dashed: relative depth</text>`);
  content.push(`<text x="224" y="145" font-size="3.1">Numbers: review points</text>`);
  content.push(`<text x="224" y="157" font-size="3.0" font-weight="700">NOT BRAILLE-READY</text>`);
  content.push(`<text x="224" y="162" font-size="3">Review fabrication first.</text></g>`);
  content.push(`<line x1="13" y1="177" x2="284" y2="177" stroke="#888" stroke-width=".25"/>`);
  content.push(`<text x="13" y="184" font-family="Arial,sans-serif" font-size="3.15" fill="#222">A4 landscape · true mm dimensions · ${(semanticPaths+depthPaths)} vector paths · ${esc(provenance.slice(0,65))}</text>`);
  content.push(`<text x="13" y="190" font-family="Arial,sans-serif" font-size="3.15" fill="#222">This is a print-scale visual draft, NOT a validated tactile drawing or an embosser file. Check line spacing and embossing process.</text>`);
  content.push(`<text x="13" y="196" font-family="Arial,sans-serif" font-size="3.15" fill="#222">Relative visual depth is not distance. AI classification can be wrong. Seek expert assessment and reader testing.</text>`);
  const stats={page:p.page,widthMm:p.widthMm,heightMm:p.heightMm,semanticPaths,depthPaths,totalPaths:semanticPaths+depthPaths,numberedMarkers:marks.length,selectedRegions:picked.length,clippedPaths:excluded,outlineMm:p.outlineMm,depthStrokeMm:p.depthStrokeMm};
  const warnings=[];
  if(excluded)warnings.push(`${excluded} paths omitted to control visual density.`);
  if(picked.length<1)warnings.push('No semantic regions selected.');
  if(semanticPaths>150)warnings.push('Dense outlines: simplify source before tactile fabrication.');
  warnings.push('Not a certified tactile diagram; specialist review and actual user testing required.');
  return {svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 210" width="297mm" height="210mm" role="img" aria-label="Print-scale visual draft of ${esc(title)}"><title>${esc(title)}: print-scale study</title><desc>Prototype A4 layout in millimetres; not a validated tactile or braille document.</desc>${content.join('')}</svg>`,stats,warnings};
}
