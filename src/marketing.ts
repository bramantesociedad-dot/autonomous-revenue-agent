import fs from "node:fs";
import path from "node:path";
import { dataDir,publicBaseUrl } from "./config.js";
const outboxPath=path.join(dataDir,"marketing-outbox.json");
type MarketingPost={at:string;productSlug:string;channel:string;copy:string;language:string;targetMarket:string;productUrl:string;status:string;detail?:string};
function load():MarketingPost[]{fs.mkdirSync(dataDir,{recursive:true});if(!fs.existsSync(outboxPath))return [];return JSON.parse(fs.readFileSync(outboxPath,"utf8"));}
function save(v:MarketingPost[]){fs.writeFileSync(outboxPath,JSON.stringify(v,null,2));}
export async function publishMarketing(input:{productSlug:string;channel:string;copy:string;language:string;targetMarket:string}){const payload={at:new Date().toISOString(),...input,productUrl:`${publicBaseUrl}/p/${input.productSlug}`};let status="queued",detail="No connector configured";
if(input.channel==="telegram"&&process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID){const url=`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text:`${input.copy}\n\n${payload.productUrl}`})});if(!r.ok)throw new Error(`Telegram publish failed ${r.status}`);status="published";detail="telegram";}
else if(input.channel==="discord"&&process.env.DISCORD_WEBHOOK_URL){const r=await fetch(process.env.DISCORD_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:`${input.copy}\n${payload.productUrl}`})});if(!r.ok)throw new Error(`Discord publish failed ${r.status}`);status="published";detail="discord";}
else if(process.env.MARKETING_WEBHOOK_URL){const headers:any={"content-type":"application/json"};if(process.env.MARKETING_WEBHOOK_BEARER)headers.authorization=`Bearer ${process.env.MARKETING_WEBHOOK_BEARER}`;const r=await fetch(process.env.MARKETING_WEBHOOK_URL,{method:"POST",headers,body:JSON.stringify(payload)});if(!r.ok)throw new Error(`Marketing webhook failed ${r.status}`);status="published";detail="generic webhook";}
const row={...payload,status,detail};const all=load();all.push(row);save(all);return row;}
export function marketingOutbox(){return load();}
