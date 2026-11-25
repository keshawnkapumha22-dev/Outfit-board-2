(()=>{
const real=window.fetch.bind(window);
const SB='https://rskszcsamcarsghqzotn.supabase.co',KEY='sb_publishable_Vl2-ruU_Y3RI_fErSfaG6Q__3jZrBio',MAIL='keshawnkapumha22@gmail.com';
const st=document.createElement('style');
st.textContent='#pk{position:fixed;inset:0;z-index:90;background:rgba(10,12,30,.5);display:grid;place-items:center;padding:16px}#pk .b{background:var(--card);color:var(--ink);border-radius:24px;padding:20px;width:min(480px,100%);max-height:80vh;display:flex;flex-direction:column;gap:12px}#pk h3{margin:0;font-size:20px}#pk p{margin:0;color:var(--mute);font-size:14px}#pk .o{overflow:auto;display:flex;flex-wrap:wrap;gap:8px}#pk form{display:flex;gap:8px}#pk input{flex:1}#pk textarea{font:inherit;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:16px;padding:12px;min-height:110px;resize:vertical}#pk .t{overflow:auto;font-size:14px;line-height:1.55}#pk .t h4{margin:14px 0 4px;font-size:15px}#pk .t p{margin:0 0 8px;color:var(--ink)}';
document.head.appendChild(st);
const f=document.getElementById('f');let what=null;
if(f){what=document.createElement('input');what.placeholder='Product name (optional)';what.setAttribute('aria-label','Product name');what.style.cssText='order:3;flex:1 1 100%';f.style.flexWrap='wrap';f.appendChild(what)}
const fail=m=>new Response(JSON.stringify({error:m}),{status:400,headers:{'Content-Type':'application/json'}});

/* feedback, privacy and terms */
function modal(fill){
  const w=document.createElement('div');w.id='pk';const b=document.createElement('div');b.className='b';
  fill(b);
  const x=document.createElement('button');x.type='button';x.textContent='Close';x.onclick=()=>w.remove();b.appendChild(x);
  w.onclick=e=>{if(e.target===w)w.remove()};w.appendChild(b);document.body.appendChild(w);
}
const el=(t,txt,c)=>{const e=document.createElement(t);if(txt)e.textContent=txt;if(c)e.className=c;return e};
function feedback(){modal(b=>{
  const t=el('textarea');t.placeholder='What happened, or what would you change?';t.maxLength=2000;
  const c=el('input');c.placeholder='Email (optional, if you want a reply)';c.style.flex='none';
  const s=el('button','Send','go'),m=el('p');
  s.onclick=async()=>{
    const v=t.value.trim();if(!v){m.textContent='Write a message first.';return}
    s.disabled=true;m.textContent='Sending…';
    try{
      const r=await real(SB+'/rest/v1/feedback',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({message:v,contact:c.value.trim()||null,page:location.hash||'home'})});
      if(!r.ok)throw 0;t.value='';m.textContent='Thank you! That really helps.';
    }catch(e){m.textContent='Couldn’t send. Please try again.'}
    s.disabled=false;
  };
  b.append(el('h3','Send feedback'),el('p','Tell us what’s confusing, broken, or missing. Everything helps.'),t,c,s,m);
})}
const doc=(title,secs)=>modal(b=>{
  const d=el('div',null,'t');
  secs.forEach(x=>{d.append(el('h4',x[0]),el('p',x[1]))});
  b.append(el('h3',title),d);
});
const privacy=()=>doc('Privacy',[
 ['Last updated','25 November 2026. Steez is an early version, and this page may change.'],
 ['What we store','Your email address and password (the password is stored securely by our login provider), the boards you save, and any photos you add to a saved board. If you send feedback, we store your message and the email you give us.'],
 ['What we don’t do','We don’t sell your data or show you ads.'],
 ['Who helps run Steez','Supabase stores accounts and boards. Vercel hosts the website. They handle data on our behalf.'],
 ['Using Steez without an account','You can build boards without signing in. They aren’t saved unless you create an account.'],
 ['Deleting your data','Email '+MAIL+' and we’ll delete your account and boards.'],
 ['Contact',MAIL]]);
const terms=()=>doc('Terms of use',[
 ['Last updated','25 November 2026.'],
 ['An early version','Steez is early and provided as is, without promises that it will always work or be available. Features may change or stop.'],
 ['Brands’ content','Product names and photos belong to the brands that made them. Steez helps you plan outfits, and links lead to each brand’s own website.'],
 ['Fair use','Please don’t copy, resell, or scrape Steez, try to break it, or use it to break the law. We may close accounts that do.'],
 ['Your boards','You keep ownership of the boards you make and the photos you add. Don’t add photos you don’t have the right to use.'],
 ['Liability','We aren’t responsible for losses from using Steez, to the extent the law allows.'],
 ['Contact',MAIL]]);
const lnk=(t,fn,done)=>{const a=el('a',t);a.href='#';a.style.cssText='color:inherit;margin-right:14px';a.onclick=e=>{e.preventDefault();if(done)done();fn()};return a};
const ft=document.querySelector('footer .W');
if(ft){const d=el('div');d.append(lnk('Privacy',privacy),lnk('Terms',terms),lnk('Feedback',feedback));ft.prepend(d)}
const mn=document.getElementById('menu'),shut=()=>{mn.hidden=true;document.getElementById('shade').hidden=true};
if(mn){mn.append(lnk('Send feedback',feedback,shut),lnk('Privacy',privacy,shut),lnk('Terms',terms,shut))}
st.textContent+='#fb{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:25;padding:15px 24px;font-size:15px;font-weight:800;letter-spacing:.08em;border-radius:999px;background:var(--ac);color:var(--ai);border:none;box-shadow:0 10px 28px rgba(47,59,255,.4);cursor:pointer}@media(max-width:700px){#app:not([hidden])~#fb{bottom:calc(46vh + 20px)}}';
const fb=el('button','FEEDBACK');fb.id='fb';fb.setAttribute('aria-label','Send feedback');fb.onclick=feedback;document.body.appendChild(fb);
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

/* gradient-aware background cleanup: paints the background pure white so the cutout can finish the job */
async function clean(bmp){
  const s=Math.min(1,1200/Math.max(bmp.width,bmp.height)),w=Math.max(1,Math.round(bmp.width*s)),h=Math.max(1,Math.round(bmp.height*s));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bmp,0,0,w,h);
  const im=x.getImageData(0,0,w,h),d=im.data,cs=[0,(w-1)*4,(h-1)*w*4,((h-1)*w+w-1)*4];
  let R=0,G=0,B=0;cs.forEach(k=>{R+=d[k];G+=d[k+1];B+=d[k+2]});R/=4;G/=4;B/=4;
  if(cs.some(k=>Math.hypot(d[k]-R,d[k+1]-G,d[k+2]-B)>40))return null;
  const bg=new Uint8Array(w*h),stk=new Int32Array(w*h);let sp=0,gone=0;
  const ok=(p,f0)=>{if(bg[p])return;const k=p*4;if(Math.hypot(d[k]-R,d[k+1]-G,d[k+2]-B)>45)return;
    if(f0>=0){const j=f0*4;if(Math.hypot(d[k]-d[j],d[k+1]-d[j+1],d[k+2]-d[j+2])>8)return}
    bg[p]=1;gone++;stk[sp++]=p};
  for(let i=0;i<w;i++){ok(i,-1);ok((h-1)*w+i,-1)}
  for(let j=0;j<h;j++){ok(j*w,-1);ok(j*w+w-1,-1)}
  while(sp){const p=stk[--sp],px=p%w,py=(p-px)/w;if(px>0)ok(p-1,p);if(px<w-1)ok(p+1,p);if(py>0)ok(p-w,p);if(py<h-1)ok(p+w,p)}
  if(gone<w*h*.08||w*h-gone<w*h*.12)return null;
  for(let p=0;p<w*h;p++)if(bg[p]){const k=p*4;d[k]=d[k+1]=d[k+2]=255}
  x.putImageData(im,0,0);
  return new Promise(r=>c.toBlob(r,'image/png'));
}
const tidy=async r=>{
  try{
    if(!r.ok)return r;
    const bmp=await createImageBitmap(await r.clone().blob());
    const out=await clean(bmp);
    return out?new Response(out,{status:200,headers:{'Content-Type':'image/png'}}):r;
  }catch(e){return r}
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
    if(orig.indexOf('data:')===0)return real(orig).then(tidy);
    const alts=ALTS.get(base(orig));
    if(!alts)return real(u,o).then(tidy);
    return pick([orig].concat(alts.map(a=>/cdn\.shopify\.com/.test(a)&&a.indexOf('?')<0?a+'?width=1400':a))).then(tidy);
  }
  return real(u,o);
};
})();
