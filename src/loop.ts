import { loopMinutes } from "./config.js";
import { runRevenueAgent } from "./agent.js";
import { scanRevenueOnce } from "./revenue-watcher.js";
import { bootstrapOnce } from "./bootstrap.js";
export async function cycle(){console.log(`\n=== Revenue cycle ${new Date().toISOString()} ===`);const boot=await bootstrapOnce().catch(e=>({ready:false,error:String(e)} as any));if(!boot.ready){console.log("[cycle] Waiting for treasury configuration and/or gas to deploy checkout.");return;}try{await scanRevenueOnce();}catch(e){console.error("Revenue scan failed:",e);}try{await runRevenueAgent();}catch(e){console.error("Agent cycle failed:",e);}}
export function startAgentLoop(){void cycle();setInterval(()=>void cycle(),loopMinutes*60_000);}
if(import.meta.url===`file://${process.argv[1]}`)startAgentLoop();
