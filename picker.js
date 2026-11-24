(()=>{
const real=window.fetch.bind(window);
const st=document.createElement('style');
st.textContent='#pk{position:fixed;inset:0;z-index:90;background:rgba(10,12,30,.5);display:grid;place-items:center;padding:16px}#pk .b{background:var(--card);color:var(--ink);border-radius:24px;padding:20px;width:min(480px,100%);max-height:80vh;display:flex;flex-direction:column;gap:12px}#pk h3{margin:0;font-size:20px}#pk p{margin:0;color:var(--mute);font-size:14px}#pk .o{overflow:auto;display:flex;flex-wrap:wrap;gap:8px}#pk form{display:flex;gap:8px}#pk input{flex:1}';
document.head.appendChild(st);
const f=document.getElementById('f');let what=null;
if(f){what=document.createElement('input');what.placeholder='Product name (optional)';what.setAttribute('aria-label','Product name');what.style.cssText='order:3;flex:1 1 100%';f.style.flexWrap='wrap';f.appendChild(what)}
const fail=m=>new Response(JSON.stringify({error:m}),{status:400,headers:{'Content-Type':'application/json'}});

/* add photos from the device */
const MY=[];
const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.multiple=true;fi.hidden=true;document.body.appendChild(fi);
if(f){
  const btn=document.createElement('button');btn.type='button';btn.textContent='Add photos from your device';btn.style.cssText='order:4;flex:1 1 100%';
  btn.onclick=()=>fi.click();f.appendChild(btn);
}
fi.onchange=async()=>{
  for(const file of [...fi.files].slice(0,12)){
    try{
      const bmp=await createImageBitmap(file);
      const s=Math.min(1,1000/Math.max(bmp.width,bmp.height)),w=Math.max(1,Math.round(bmp.width*s)),h=Math.max(1,Math.round(bmp.height*s));
      const c=document.createElement('canvas');c.width=w;c.height=h;
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bmp,0,0,w,h);
      MY.push({title:(file.name||'My photo').replace(/\.[^.]+$/,'')||'My photo',type:'',tags:'',price:'',image:c.toDataURL('image/jpeg',.9),link:''});
    }catch(e){}
  }
  fi.value='';
  if(MY.length&&f){document.getElementById('url').value='steez:photos';f.requestSubmit()}
};

/* product-only photos: remember each piece's other photos, then use the first one with a plain background */
const ALTS=new Map(),base=x=>x.split('?')[0];
const rec=d=>{(d&&d.products||[]).forEach(p=>{if(p.alts&&p.alts.length)ALTS.set(base(p.image),p.alts)})};
const plain=bmp=>{
  const c=document.createElement('canvas');c.width=c.height=48;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bmp,0,0,48,48);
  const d=x.getImageData(0,0,48,48).data,k=[0,47*4,47*48*4,(47*48+47)*4];let R=0,G=0,B=0;
  k.forEach(i=>{R+=d[i];G+=d[i+1];B+=d[i+2]});R/=4;G/=4;B/=4;
  return k.every(i=>Math.hypot(d[i]-R,d[i+1]-G,d[i+2]-B)<=20);
};
async function pick(list){
  let first=null;
  for(const x of list.slice(0,4)){
    try{
      const r=await real('/api/image?url='+encodeURIComponent(x));
      if(!r.ok)continue;
      const b=await r.blob(),bmp=await createImageBitmap(b);
      if(plain(bmp))return new Response(b,{status:200,headers:{'Content-Type':b.type||'image/png'}});
      if(!first)first=b;
    }catch(e){}
  }
  return first?new Response(first,{status:200,headers:{'Content-Type':first.type||'image/png'}}):fail('Couldn’t load a photo.');
}

function choose(baseUrl,d){
  return new Promise(done=>{
    const w=document.createElement('div');w.id='pk';
    const b=document.createElement('div');b.className='b';
    const h=document.createElement('h3');h.textContent='What do you want?';
    const p=document.createElement('p');p.textContent=d.message||'';
    const o=document.createElement('div');o.className='o';
    const go=u=>{w.remove();done(real(u))};
    (d.options||[]).forEach(x=>{const k=document.createElement('button');k.type='button';k.textContent=x.label;k.onclick=()=>go(baseUrl+'&cat='+encodeURIComponent(x.cat));o.appendChild(k)});
    const fm=document.createElement('form');
    const i=document.createElement('input');i.placeholder='Or type a product name';
    const s=document.createElement('button');s.className='go';s.textContent='Search';
    fm.append(i,s);fm.onsubmit=e=>{e.preventDefault();if(i.value.trim())go(baseUrl+'&q='+encodeURIComponent(i.value.trim()))};
    const c=document.createElement('button');c.type='button';c.textContent='Cancel';c.onclick=()=>{w.remove();done(fail('Cancelled.'))};
    b.append(h,p,o,fm,c);w.appendChild(b);document.body.appendChild(w);
  });
}
window.fetch=function(u,o){
  if(typeof u==='string'&&u.indexOf('/api/products?')===0){
    if(u.indexOf('url=steez%3Aphotos')>-1)return Promise.resolve(new Response(JSON.stringify({store:'my-photos',products:MY}),{status:200,headers:{'Content-Type':'application/json'}}));
    const n=what&&what.value.trim(),url=u+(n?'&q='+encodeURIComponent(n):'');
    return real(url,o).then(r=>r.clone().json().then(d=>{if(d&&d.needsChoice)return choose(u,d);rec(d);return r}).catch(()=>r));
  }
  if(typeof u==='string'&&u.indexOf('/api/image?url=')===0){
    const orig=decodeURIComponent(u.slice(u.indexOf('=')+1));
    if(orig.indexOf('data:')===0)return real(orig);
    const alts=ALTS.get(base(orig));
    if(!alts)return real(u,o);
    return pick([orig].concat(alts.map(a=>/cdn\.shopify\.com/.test(a)&&a.indexOf('?')<0?a+'?width=1400':a)));
  }
  return real(u,o);
};
})();
