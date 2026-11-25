(()=>{
/* stop double-tap page zoom */
const st=document.createElement('style');st.textContent='html,body{touch-action:manipulation}';document.head.appendChild(st);
let lt=0;
document.addEventListener('touchend',e=>{const n=Date.now();if(n-lt<350&&!(e.target.closest&&e.target.closest('button,input,textarea,a,select,label')))e.preventDefault();lt=n},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault());
})();

(()=>{
const m=document.querySelector('meta[name=viewport]');
const fix=()=>{if(!m)return;const c=m.content;m.content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';setTimeout(()=>{m.content=c},400);scrollTo(0,0)};
fix();
const b=document.createElement('button');b.textContent='Page is zoomed in. Tap to fit the screen';
b.style.cssText='position:fixed;left:12px;top:70px;transform-origin:0 0;z-index:100;padding:12px 18px;border-radius:999px;border:none;background:#12142b;color:#fff;font:600 14px system-ui;display:none';
b.onclick=()=>{fix();b.style.display='none'};document.body.appendChild(b);
const vv=window.visualViewport;
const chk=()=>{
  if(!vv)return;
  const z=vv.scale>1.05;b.style.display=z?'block':'none';
  if(z){b.style.left=vv.offsetLeft+12+'px';b.style.top=vv.offsetTop+70+'px';b.style.transform='scale('+1/vv.scale+')'}
};
if(vv){vv.addEventListener('resize',chk);vv.addEventListener('scroll',chk)}
chk();
addEventListener('pageshow',fix);
})();

(()=>{
/* background removal: quick method for plain photos, AI only when needed */
const prev=window.fetch.bind(window);
const note=document.getElementById('note');
const say=t=>{if(!note)return;note.textContent=t;note.style.opacity=t?1:0};
let lib=null,failed=false,q=Promise.resolve();
const memo=new Map();
const load=()=>lib||(lib=import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm').then(m=>m.removeBackground||m.default).catch(()=>{failed=true;return null}));
setTimeout(load,1500);
const bmpOf=b=>createImageBitmap(b);
const ringWhite=bmp=>{
  const w=Math.min(300,bmp.width),h=Math.max(1,Math.round(bmp.height*w/bmp.width));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bmp,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data;let n=0,ok=0;
  const t=(i,j)=>{const k=(j*w+i)*4;n++;if(d[k]>=250&&d[k+1]>=250&&d[k+2]>=250)ok++};
  for(let i=0;i<w;i++){t(i,0);t(i,h-1)}for(let j=0;j<h;j++){t(0,j);t(w-1,j)}
  return ok/n>=.97;
};
async function ai(blob){
  const rb=await load();if(!rb)return null;
  say('Removing background (the first one takes longer)…');
  const src=await bmpOf(blob),s=Math.min(1,1024/Math.max(src.width,src.height)),w=Math.max(1,Math.round(src.width*s)),h=Math.max(1,Math.round(src.height*s));
  const c0=document.createElement('canvas');c0.width=w;c0.height=h;c0.getContext('2d').drawImage(src,0,0,w,h);
  const small=await new Promise(r=>c0.toBlob(r,'image/png'));
  const out=await rb(small,{model:'isnet_quint8',output:{format:'image/png'}});
  const bmp=await bmpOf(out),W=bmp.width,H=bmp.height,N=W*H;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bmp,0,0);
  const im=x.getImageData(0,0,W,H),d=im.data,m=new Uint8Array(N);let fg=0;
  for(let p=0;p<N;p++)if(d[p*4+3]>=128){m[p]=1;fg++}
  if(fg<N*.03||fg>N*.97)return null;
  const lab=new Int32Array(N),sizes=[0],stk=new Int32Array(N);let L=0;
  for(let p=0;p<N;p++){
    if(!m[p]||lab[p])continue;
    L++;let sp=0,n=0;stk[sp++]=p;lab[p]=L;
    while(sp){
      const a=stk[--sp];n++;const ax=a%W,ay=(a-ax)/W;
      if(ax>0&&m[a-1]&&!lab[a-1]){lab[a-1]=L;stk[sp++]=a-1}
      if(ax<W-1&&m[a+1]&&!lab[a+1]){lab[a+1]=L;stk[sp++]=a+1}
      if(ay>0&&m[a-W]&&!lab[a-W]){lab[a-W]=L;stk[sp++]=a-W}
      if(ay<H-1&&m[a+W]&&!lab[a+W]){lab[a+W]=L;stk[sp++]=a+W}
    }
    sizes[L]=n;
  }
  let big=0;for(const v of sizes)if(v>big)big=v;
  for(let p=0;p<N;p++){
    const k=p*4;
    if(m[p]&&sizes[lab[p]]>=big*.03){d[k+3]=255}
    else{d[k]=255;d[k+1]=0;d[k+2]=255;d[k+3]=3}
  }
  x.putImageData(im,0,0);
  return new Promise(r=>c.toBlob(r,'image/png'));
}
window.fetch=function(u,o){
  if(typeof u==='string'&&u.indexOf('/api/image?url=')===0){
    if(memo.has(u))return memo.get(u).then(b=>new Response(b,{status:200,headers:{'Content-Type':'image/png'}}));
    return prev(u,o).then(async r=>{
      if(!r.ok||failed)return r;
      try{if(ringWhite(await bmpOf(await r.clone().blob())))return r}catch(e){return r}
      const job=q.then(async()=>{try{return await ai(await r.clone().blob())}catch(e){return null}finally{say('')}});
      q=job;
      return job.then(b=>{
        if(!b)return r;
        if(memo.size>30)memo.clear();
        memo.set(u,Promise.resolve(b));
        return new Response(b,{status:200,headers:{'Content-Type':'image/png'}});
      });
    });
  }
  return prev(u,o);
};
})();
