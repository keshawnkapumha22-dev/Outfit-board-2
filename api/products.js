const UA="Mozilla/5.0 (compatible; OutfitBoard/0.2)";
const blocked=h=>h==="localhost"||h.endsWith(".local")||/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h)||h.includes(":");
const S=v=>String(v==null?"":v);
const get=async(url,json)=>{try{const r=await fetch(url,{headers:{"User-Agent":UA,Accept:json?"application/json":"text/html,*/*"},signal:AbortSignal.timeout(5500)});if(!r.ok)return null;return json?await r.json():await r.text()}catch{return null}};
const abs=(x,b)=>{try{return new URL(x,b).href}catch{return""}};

async function shopify(origin,handle){
  const base=handle?origin+"/collections/"+encodeURIComponent(handle):origin;let all=[];
  for(let p=1;p<=3;p++){const d=await get(base+"/products.json?limit=250&page="+p,1);if(!d||!Array.isArray(d.products))break;all=all.concat(d.products);if(d.products.length<250)break}
  return all.filter(p=>p.images&&p.images.length).map(p=>({title:S(p.title),type:S(p.product_type),tags:Array.isArray(p.tags)?p.tags.join(" "):S(p.tags),price:S(p.variants&&p.variants[0]&&p.variants[0].price),image:p.images[0].src,link:origin+"/products/"+p.handle}));
}
async function woo(origin,q,cat){
  const d=await get(origin+"/wp-json/wc/store/v1/products?per_page=100"+(q?"&search="+encodeURIComponent(q):"")+(cat?"&category="+encodeURIComponent(cat):""),1);
  if(!Array.isArray(d)||!d.length)return null;
  return d.map(p=>({title:S(p.name),type:S(p.categories&&p.categories[0]&&p.categories[0].name),tags:(p.tags||[]).map(t=>t.name).join(" "),price:p.prices?(p.prices.price/Math.pow(10,p.prices.currency_minor_unit||2)).toFixed(2):"",image:S(p.images&&p.images[0]&&p.images[0].src),link:S(p.permalink)})).filter(p=>p.image);
}
const walk=(o,out,d=0)=>{
  if(!o||typeof o!=="object"||d>6)return;
  if(Array.isArray(o)){o.forEach(x=>walk(x,out,d+1));return}
  const t=[].concat(o["@type"]||[]);
  if(t.includes("Product")){
    let im=o.image;if(Array.isArray(im))im=im[0];if(im&&typeof im==="object")im=im.url;
    let of=o.offers;if(Array.isArray(of))of=of[0];
    if(o.name&&im)out.push({title:S(o.name),type:"",tags:"",price:S(of&&(of.price||of.lowPrice)),image:S(im),link:S(o.url||(of&&of.url))});
  }
  for(const k in o)if(k!=="image")walk(o[k],out,d+1);
};
const imgSrc=(tag,base)=>{
  const g=n=>(tag.match(new RegExp("\\s"+n+"=[\"']([^\"']+)","i"))||[])[1];
  const ss=(g("srcset")||g("data-srcset")||"").split(",")[0].trim().split(" ")[0];
  const s=[g("data-src"),g("src"),ss].find(x=>x&&!x.startsWith("data:"));
  if(!s||/\.svg(\?|$)|sprite|logo|icon/i.test(s))return"";
  return abs(s,base);
};
const CAT=/\/(w|c|collections?|categor(y|ies)|shop)\//i;
function anchors(html,base){
  const map=new Map(),links=new Map();
  for(const m of html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    const href=abs(m[1],base);if(!href)continue;
    const inner=m[2],img=inner.match(/<img[^>]+>/i);
    const text=inner.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
    const aria=(m[0].match(/aria-label=["']([^"']+)/i)||[])[1]||"";
    if(!img){
      try{if(CAT.test(new URL(href).pathname)&&text.length>2&&text.length<40&&!/^[\d\W]+$/.test(text)&&!links.has(text.toLowerCase()))links.set(text.toLowerCase(),{label:text,cat:href})}catch{}
      if(text.length<3&&!aria)continue;
    }
    const e=map.get(href)||{title:"",type:"",tags:"",price:"",image:"",link:href};
    const t=text.length>aria.length?text:aria;
    if(t.length>e.title.length&&t.length<140)e.title=t;
    if(img&&!e.image){e.image=imgSrc(img[0],base);if(!e.title)e.title=(img[0].match(/\salt=["']([^"']+)/i)||[])[1]||""}
    const pr=text.match(/\$\s?(\d[\d,.]*)/);if(pr&&!e.price)e.price=pr[1].replace(/,/g,"");
    map.set(href,e);
  }
  return{items:[...map.values()].filter(e=>e.image&&e.title.length>2),links:[...links.values()]};
}
async function generic(pageUrl){
  const html=await get(pageUrl,0);if(!html)return null;
  let items=[];
  for(const m of html.matchAll(/<script[^>]+ld\+json[^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1].trim()),items)}catch{}}
  const a=anchors(html,pageUrl);const seen=new Set();
  items=items.concat(a.items).map(p=>({...p,image:abs(p.image,pageUrl),link:abs(p.link||pageUrl,pageUrl)})).filter(p=>p.image&&p.title&&!seen.has(p.link)&&seen.add(p.link));
  return{items,links:a.links};
}

module.exports=async(req,res)=>{
  res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate");
  let input=S(req.query.url).trim();const q=S(req.query.q).trim().toLowerCase(),cat=S(req.query.cat).trim();
  if(!input)return res.status(400).json({error:"Paste a store link first."});
  if(!/^https?:\/\//i.test(input))input="https://"+input;
  let u;try{u=new URL(input);if(blocked(u.hostname))throw 0}catch{return res.status(400).json({error:"That doesn't look like a store link."})}
  const origin=u.origin,host=u.hostname.replace(/^www\./,"");
  const ok=l=>res.status(200).json({store:host,products:l.slice(0,250)});
  const choose=(options,message)=>res.status(200).json({store:host,needsChoice:true,options:options.slice(0,60),message});
  const miss=msg=>res.status(404).json({error:msg});
  const match=p=>!q||q.split(/\s+/).every(w=>(p.title+" "+p.type+" "+p.tags).toLowerCase().includes(w));
  try{
    if(/^https?:\/\//i.test(cat)){
      const g=await generic(cat);if(!g||!g.items.length)return miss("Couldn't read pieces from that page.");
      return ok(g.items.filter(match));
    }
    const num=/^\d+$/.test(cat),handle=(cat&&!num)?cat:(u.pathname.match(/^\/collections\/([^\/]+)/)||[])[1];
    const [sh,wo]=await Promise.all([shopify(origin,handle),handle?null:woo(origin,q,num?cat:"")]);
    if(sh&&sh.length){
      const l=sh.filter(match);
      if(!q&&!handle&&l.length>50){
        const c=await get(origin+"/collections.json?limit=250",1);
        const o=((c&&c.collections)||[]).filter(x=>x.products_count>0).map(x=>({label:x.title+" ("+x.products_count+")",cat:x.handle}));
        if(o.length)return choose(o,"This brand has "+l.length+"+ pieces. Pick a collection, or type what you’re looking for.");
      }
      return l.length?ok(l):miss("No pieces matched that name.");
    }
    if(wo&&wo.length){
      if(!q&&!cat&&wo.length>50){
        const c=await get(origin+"/wp-json/wc/store/v1/products/categories?per_page=100",1);
        const o=(Array.isArray(c)?c:[]).filter(x=>x.count>0).map(x=>({label:S(x.name).replace(/&amp;/g,"&")+" ("+x.count+")",cat:String(x.id)}));
        if(o.length)return choose(o,"Lots of pieces here. Pick a category, or type what you’re looking for.");
      }
      return ok(wo);
    }
    let g=null,searched=false;
    if(q){const e=encodeURIComponent(q);for(const s of [origin+"/w?q="+e,origin+"/search?q="+e,origin+"/?s="+e+"&post_type=product"]){const r=await generic(s);if(r&&r.items.length){g=r;searched=true;break}}}
    if(!g)g=await generic(u.href);
    if(!g||(!g.items.length&&!g.links.length))return miss("Couldn't read pieces from this site. It may block automatic reading.");
    if(!q&&!cat&&u.pathname.replace(/\/+$/,"")===""&&g.links.length>=3)return choose(g.links,"Pick a category to pull pieces from, or type what you’re looking for.");
    const l=searched?g.items:g.items.filter(match);
    return l.length?ok(l):miss("No pieces matched. Try a category page link, or a different name.");
  }catch(e){return res.status(502).json({error:"The site didn't respond. Try again in a moment."})}
};
