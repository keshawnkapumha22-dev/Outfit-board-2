(()=>{
/* stop double-tap page zoom */
const st=document.createElement('style');st.textContent='html,body{touch-action:manipulation}';document.head.appendChild(st);
let lt=0;
document.addEventListener('touchend',e=>{const n=Date.now();if(n-lt<350&&!(e.target.closest&&e.target.closest('button,input,textarea,a,select,label')))e.preventDefault();lt=n},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault());

/* AI background removal */
const prev=window.fetch.bind(window);
const note=document.getElementById('note');
const say=t=>{if(!note)return;note.textContent=t;note.style.opacity=t?1:0};
let lib=null,failed=false,q=Promise.resolve();
const load=()=>lib||(lib=import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm').then(m=>m.removeBackground||m.default).catch(()=>{failed=true;return null}));
async function ai(blob){
  const rb=await load();if(!rb)return null;
  say('Preparing the background remover (first time only, this can take a minute)…');
  const out=await rb(blob,{model:'isnet_quint8',output:{format:'image/png'}});
  const bmp=await createImageBitmap(out);
  const c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bmp,0,0);
  const im=x.getImageData(0,0,c.width,c.height),d=im.data;let fg=0;
  for(let i=0;i<d.length;i+=4)if(d[i+3]>=128)fg++;
  const frac=fg/(d.length/4);
  if(frac<.03||frac>.97)return null;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<128){d[i]=255;d[i+1]=0;d[i+2]=255}d[i+3]=255}
  x.putImageData(im,0,0);
  return new Promise(r=>c.toBlob(r,'image/png'));
}
window.fetch=function(u,o){
  if(typeof u==='string'&&u.indexOf('/api/image?url=')===0){
    return prev(u,o).then(r=>{
      if(!r.ok||failed)return r;
      q=q.then(async()=>{
        try{
          const out=await ai(await r.clone().blob());
          return out?new Response(out,{status:200,headers:{'Content-Type':'image/png'}}):r;
        }catch(e){return r}
        finally{say('')}
      });
      return q;
    });
  }
  return prev(u,o);
};
})();
