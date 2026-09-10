import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { chain, port, storeName, treasuryAddress, targetUsd, networkName, dataDir } from "./config.js";
import { listProducts, getProduct, createOrder, getOrderBySecret, salesMetrics } from "./products.js";
import { directCheckoutCalldata, verifyDirectPayment } from "./direct-payment.js";
import { walletSnapshot, treasurySnapshot } from "./blockchain.js";
import { summarizeLedger, goalStatus } from "./ledger.js";
import { ensureAdminToken, requestIsAdmin } from "./admin-auth.js";

const analyticsPath = path.join(dataDir, "funnel-events.json");
type FunnelEvent = { at:string; type:string; slug?:string; referrer?:string; ua?:string };

function loadEvents(): FunnelEvent[] {
  fs.mkdirSync(dataDir,{recursive:true});
  if(!fs.existsSync(analyticsPath)) return [];
  try{return JSON.parse(fs.readFileSync(analyticsPath,"utf8"));}catch{return [];}
}
function recordEvent(e:FunnelEvent){const rows=loadEvents();rows.push(e);if(rows.length>20000)rows.splice(0,rows.length-20000);fs.writeFileSync(analyticsPath,JSON.stringify(rows,null,2));}
function funnelMetrics(){const rows=loadEvents();const byProduct:any={};for(const e of rows){if(!e.slug)continue;byProduct[e.slug]??={views:0,checkoutStarts:0};if(e.type==="product_view")byProduct[e.slug].views++;if(e.type==="checkout_start")byProduct[e.slug].checkoutStarts++;}return {events:rows.length,byProduct};}
function send(res:http.ServerResponse,status:number,body:string,type="text/html; charset=utf-8",headers:any={}){res.writeHead(status,{"content-type":type,"cache-control":"no-store",...headers});res.end(body);}
function json(res:http.ServerResponse,status:number,data:any){send(res,status,JSON.stringify(data,null,2),"application/json; charset=utf-8");}
function esc(v:any){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
async function readBody(req:http.IncomingMessage){let body="";for await(const c of req)body+=c;return body;}
function money(n:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);}
const contentTypes:any={markdown:["text/markdown; charset=utf-8","md"],text:["text/plain; charset=utf-8","txt"],html:["text/html; charset=utf-8","html"],json:["application/json; charset=utf-8","json"],csv:["text/csv; charset=utf-8","csv"]};
const sources:any={
  "la-escalera-21-dias":{name:"La Escalera",url:"https://bramantesociedad.com/escalera"},
  "a-escada-21-dias":{name:"La Escalera",url:"https://bramantesociedad.com/escalera"},
  "mission-12-secret-adventures":{name:"La Misión",url:"https://mision.app/"},
  "mision-primera-venta":{name:"La Misión",url:"https://mision.app/"}
};
const css="body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f6f4ef;color:#171717}main{max-width:1020px;margin:auto;padding:34px 20px 72px}.hero{padding:54px 0 32px}.hero h1{font-size:clamp(38px,7vw,72px);line-height:.96;margin:0 0 18px}.hero p{font-size:20px;max-width:760px;color:#555}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.card{background:#fff;border:1px solid #ddd;border-radius:18px;padding:24px}.price{font-size:29px;font-weight:800}.btn,button{display:inline-block;background:#171717;color:#fff;border:0;border-radius:12px;padding:13px 18px;text-decoration:none;font-size:16px;cursor:pointer}.muted{color:#666}.status{white-space:pre-wrap;margin-top:18px;padding:12px;background:#efeee9;border-radius:10px;min-height:20px}code{word-break:break-all}table{width:100%;border-collapse:collapse;background:#fff}th,td{text-align:left;padding:10px;border-bottom:1px solid #eee}@media(max-width:600px){main{padding:20px 16px}.hero{padding-top:30px}}";

export function startPilotStoreServer(){
  ensureAdminToken();
  const server=http.createServer(async(req,res)=>{
    try{
      const u=new URL(req.url||"/","http://"+(req.headers.host||"localhost"));

      if(req.method==="GET"&&u.pathname==="/"){
        recordEvent({at:new Date().toISOString(),type:"store_view",referrer:String(req.headers.referer||""),ua:String(req.headers["user-agent"]||"")});
        const cards=listProducts().filter(p=>p.active).map(p=>{
          const src=sources[p.slug];
          return "<article class=card><div class=muted>"+esc(p.targetMarket)+" · "+esc(p.language)+"</div><h2>"+esc(p.title)+"</h2><p>"+esc(p.description)+"</p><div class=price>"+money(p.priceUsd)+" USDC</div>"+(src?"<p class=muted>Based on: <a href='"+esc(src.url)+"'>"+esc(src.name)+"</a></p>":"")+"<a class=btn href='/p/"+encodeURIComponent(p.slug)+"'>View product</a></article>";
        }).join("");
        return send(res,200,"<!doctype html><html><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>"+esc(storeName)+"</title><meta name=description content='Practical digital products and real-life missions.'><style>"+css+"</style></head><body><main><section class=hero><div class=muted>AUTONOMOUS COMMERCIAL PILOT</div><h1>Useful digital products.<br>Real experiments.</h1><p>Low-cost digital programs and experiences built from established projects. The catalog evolves according to measured demand and paid sales.</p></section><section class=grid>"+(cards||"<div class=card>Preparing the first offers.</div>")+"</section></main></body></html>");
      }

      const pm=u.pathname.match(/^\/p\/([^/]+)$/);
      if(req.method==="GET"&&pm){
        const p=getProduct(decodeURIComponent(pm[1]));
        if(!p||!p.active)return send(res,404,"Product not found");
        recordEvent({at:new Date().toISOString(),type:"product_view",slug:p.slug,referrer:String(req.headers.referer||""),ua:String(req.headers["user-agent"]||"")});
        const src=sources[p.slug];
        const html="<!doctype html><html lang='"+esc(p.language)+"'><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>"+esc(p.title)+"</title><meta name=description content='"+esc(p.description)+"'><meta property='og:title' content='"+esc(p.title)+"'><meta property='og:description' content='"+esc(p.description)+"'><style>"+css+"</style></head><body><main><a href='/' style='color:#111'>← Store</a><section class=hero><div class=muted>"+esc(p.targetMarket)+" · "+esc(p.language)+"</div><h1>"+esc(p.title)+"</h1><p>"+esc(p.description)+"</p></section><div class=card><div class=price>"+money(p.priceUsd)+" USDC</div><p>Pay USDC directly to the seller treasury on Base. The product unlocks after the payment is verified.</p>"+(src?"<p class=muted>Project source: <a href='"+esc(src.url)+"'>"+esc(src.name)+"</a></p>":"")+"<button id='buy'>Buy & unlock</button><div class=status id='s'></div></div><script>const product="+JSON.stringify({id:p.id,slug:p.slug,priceUsd:p.priceUsd})+";const chainId="+chain.id+";const chainHex='0x'+chainId.toString(16);async function receipt(h){for(let i=0;i<90;i++){const r=await ethereum.request({method:'eth_getTransactionReceipt',params:[h]});if(r)return r;await new Promise(x=>setTimeout(x,1500));}throw Error('Confirmation timeout');}async function sw(){const c=await ethereum.request({method:'eth_chainId'});if(c.toLowerCase()===chainHex.toLowerCase())return;await ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:chainHex}]});}document.getElementById('buy').onclick=async()=>{const st=document.getElementById('s');try{if(!window.ethereum)throw Error('A Base-compatible wallet is required.');const a=await ethereum.request({method:'eth_requestAccounts'});const from=a[0];await sw();fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'checkout_start',slug:product.slug})});st.textContent='Creating order...';let r=await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({productId:product.id,payer:from})});let o=await r.json();if(!r.ok)throw Error(o.error||'Order error');st.textContent='Sending '+product.priceUsd+' USDC directly to seller treasury...';const h=await ethereum.request({method:'eth_sendTransaction',params:[{from:from,to:o.to,data:o.data}]});st.textContent='Payment sent. Waiting for confirmation...';await receipt(h);st.textContent='Verifying payment...';let vr=await fetch('/api/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({secret:o.secret,txHash:h})});let v=await vr.json();if(!vr.ok)throw Error(v.error||'Verification failed');location.href=o.downloadUrl;}catch(e){st.textContent=e.message||String(e);}};</script></main></body></html>";
        return send(res,200,html);
      }

      if(req.method==="POST"&&u.pathname==="/api/event"){
        const input=JSON.parse(await readBody(req)||"{}");
        if(["checkout_start"].includes(String(input.type)))recordEvent({at:new Date().toISOString(),type:String(input.type),slug:String(input.slug||"")});
        return json(res,200,{ok:true});
      }

      if(req.method==="POST"&&u.pathname==="/api/orders"){
        if(!treasuryAddress)return json(res,503,{error:"Treasury not configured"});
        const input=JSON.parse(await readBody(req)||"{}");
        const p=getProduct(String(input.productId||""));
        if(!p||!p.active)return json(res,404,{error:"product not found"});
        if(!/^0x[a-fA-F0-9]{40}$/.test(String(input.payer||"")))return json(res,400,{error:"payer wallet required"});
        const order=createOrder(p.id,String(input.payer),p.priceUsd);
        const tx=directCheckoutCalldata(p.priceUsd);
        return json(res,200,{orderId:order.orderId,secret:order.secret,chainId:chain.id,...tx,downloadUrl:"/download/"+order.secret});
      }

      if(req.method==="POST"&&u.pathname==="/api/verify"){
        const input=JSON.parse(await readBody(req)||"{}");
        if(!/^0x[a-fA-F0-9]{64}$/.test(String(input.txHash||"")))return json(res,400,{error:"valid transaction hash required"});
        return json(res,200,await verifyDirectPayment(String(input.secret||""),input.txHash));
      }

      const dm=u.pathname.match(/^\/download\/([a-f0-9]{64})$/);
      if(req.method==="GET"&&dm){
        const order=getOrderBySecret(dm[1]);if(!order)return send(res,404,"Order not found");
        if(!order.paid)return send(res,402,"<h1>Payment not confirmed yet</h1>");
        const p=getProduct(order.productId);if(!p)return send(res,404,"Product not found");
        const pair=contentTypes[p.format]||contentTypes.text;
        return send(res,200,p.content,pair[0],{"content-disposition":"attachment; filename=\""+p.slug+"."+pair[1]+"\""});
      }

      if(req.method==="GET"&&u.pathname==="/sitemap.xml"){
        const base="https://"+(req.headers.host||"");
        const urls=listProducts().filter(p=>p.active).map(p=>"<url><loc>"+base+"/p/"+encodeURIComponent(p.slug)+"</loc><lastmod>"+p.updatedAt+"</lastmod></url>").join("");
        return send(res,200,"<?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'><url><loc>"+base+"/</loc></url>"+urls+"</urlset>","application/xml; charset=utf-8");
      }
      if(req.method==="GET"&&u.pathname==="/robots.txt")return send(res,200,"User-agent: *\nAllow: /\nSitemap: https://"+(req.headers.host||"")+"/sitemap.xml\n","text/plain");

      if(req.method==="GET"&&u.pathname==="/admin/login")return send(res,200,"<!doctype html><meta charset=utf-8><style>"+css+"</style><main><h1>Revenue Pilot</h1><form method=post><input style='padding:12px;width:100%;box-sizing:border-box' type=password name=token placeholder='Admin token'><br><br><button>Open dashboard</button></form></main>");
      if(req.method==="POST"&&u.pathname==="/admin/login"){
        const token=new URLSearchParams(await readBody(req)).get("token")||"";if(token!==ensureAdminToken().token)return send(res,403,"Invalid token");
        res.writeHead(302,{"set-cookie":"ra_admin="+encodeURIComponent(token)+"; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000",location:"/admin"});return res.end();
      }
      if(req.method==="GET"&&u.pathname==="/admin"){
        if(!requestIsAdmin(req)){res.writeHead(302,{location:"/admin/login"});return res.end();}
        const ledger=summarizeLedger(),goal=goalStatus(),sales=salesMetrics(),funnel=funnelMetrics();
        const [agent,treasury]=await Promise.all([walletSnapshot(),treasurySnapshot()]);
        const rows=sales.byProduct.map(x=>{const f=funnel.byProduct[x.slug]||{views:0,checkoutStarts:0};return "<tr><td>"+esc(x.title)+"</td><td>"+esc(x.targetMarket)+"</td><td>"+f.views+"</td><td>"+f.checkoutStarts+"</td><td>"+x.sales+"</td><td>"+money(x.revenueUsd)+"</td></tr>";}).join("");
        return send(res,200,"<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><style>"+css+"</style><main><h1>Revenue Agent — Autonomous Pilot</h1><p>"+esc(networkName)+" · direct USDC</p><div class=grid><div class=card><div>Paid sales</div><div class=price>"+money(ledger.revenueUsd)+"</div></div><div class=card><div>Target</div><div class=price>"+money(targetUsd)+"</div><div>"+goal.progressPct+"%</div></div><div class=card><div>Transactions</div><div class=price>"+sales.totalSales+"</div></div><div class=card><div>Tracked events</div><div class=price>"+funnel.events+"</div></div></div><h2>Funnel by product</h2><table><tr><th>Product</th><th>Market</th><th>Views</th><th>Checkout starts</th><th>Sales</th><th>Revenue</th></tr>"+rows+"</table><h2>Treasury</h2><div class=card><code>"+esc(treasuryAddress||"")+"</code><p>"+esc(treasury?.usdcBalance??"-")+" USDC</p></div><p class=muted>Operational wallet: <code>"+esc(agent.address)+"</code></p></main>");
      }

      if(req.method==="GET"&&u.pathname==="/api/health")return json(res,200,{ok:true,mode:"autonomous-pilot",network:networkName,chainId:chain.id,treasuryConfigured:!!treasuryAddress,checkoutReady:!!treasuryAddress,products:listProducts().filter(p=>p.active).length});
      return send(res,404,"Not found");
    }catch(e:any){return json(res,500,{error:e?.message||String(e)});}
  });
  server.listen(port,()=>console.log("[pilot-web] listening on :"+port));
  return server;
}

if(import.meta.url===`file://${process.argv[1]}`)startPilotStoreServer();
