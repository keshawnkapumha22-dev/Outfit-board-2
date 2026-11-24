(()=>{
const real=window.fetch.bind(window);
const st=document.createElement('style');
st.textContent='#pk{position:fixed;inset:0;z-index:90;background:rgba(10,12,30,.5);display:grid;place-items:center;padding:16px}#pk .b{background:var(--card);color:var(--ink);border-radius:24px;padding:20px;width:min(480px,100%);max-height:80vh;display:flex;flex-direction:column;gap:12px}#pk h3{margin:0;font-size:20px}#pk p{margin:0;color:var(--mute);font-size:14px}#pk .o{overflow:auto;display:flex;flex-wrap:wrap;gap:8px}#pk form{display:flex;gap:8px}#pk input{flex:1}';
document.head.appendChild(st);
const f=document.getElementById('f');let what=null;
if(f){what=document.createElement('input');what.placeholder='Product name (optional)';what.setAttribute('aria-label','Product name');what.style.cssText='order:3;flex:1 1 100%';f.style.flexWrap='wrap';f.appendChild(what)}
const fail=m=>new Response(JSON.stringify({error:m}),{status:400,headers:{'Content-Type':'application/json'}});
function choose(base,d){
  return new Promise(done=>{
    const w=document.createElement('div');w.id='pk';
    const b=document.createElement('div');b.className='b';
    const h=document.createElement('h3');h.textContent='What do you want?';
    const p=document.createElement('p');p.textContent=d.message||'';
    const o=document.createElement('div');o.className='o';
    const go=u=>{w.remove();done(real(u))};
    (d.options||[]).forEach(x=>{const k=document.createElement('button');k.type='button';k.textContent=x.label;k.onclick=()=>go(base+'&cat='+encodeURIComponent(x.cat));o.appendChild(k)});
    const fm=document.createElement('form');
    const i=document.createElement('input');i.placeholder='Or type a product name';
    const s=document.createElement('button');s.className='go';s.textContent='Search';
    fm.append(i,s);fm.onsubmit=e=>{e.preventDefault();if(i.value.trim())go(base+'&q='+encodeURIComponent(i.value.trim()))};
    const c=document.createElement('button');c.type='button';c.textContent='Cancel';c.onclick=()=>{w.remove();done(fail('Cancelled.'))};
    b.append(h,p,o,fm,c);w.appendChild(b);document.body.appendChild(w);
  });
}
window.fetch=function(u,o){
  if(typeof u==='string'&&u.indexOf('/api/products?')===0){
    const n=what&&what.value.trim(),url=u+(n?'&q='+encodeURIComponent(n):'');
    return real(url,o).then(r=>r.clone().json().then(d=>d&&d.needsChoice?choose(u,d):r).catch(()=>r));
  }
  return real(u,o);
};
})();
