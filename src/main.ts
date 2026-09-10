import { startStoreServer } from "./store-server.js";
import { bootstrapOnce } from "./bootstrap.js";
import { startAgentLoop } from "./loop.js";
import { scanRevenueOnce } from "./revenue-watcher.js";
import { pilotMode } from "./config.js";
import { seedPilotProducts } from "./pilot-products.js";
import { seedMarketPilotProducts } from "./pilot-products-market.js";

if(pilotMode){
  seedPilotProducts();
  seedMarketPilotProducts();
}
startStoreServer();

const boot=await bootstrapOnce();
console.log("[startup]",boot);

if(boot.ready && !pilotMode){
  await scanRevenueOnce().catch(e=>console.error("Initial revenue scan failed:",e));
}

startAgentLoop();

if(!pilotMode){
  setInterval(async()=>{
    try{
      const b=await bootstrapOnce();
      if(b.ready) await scanRevenueOnce();
    }catch(e){console.error("Background bootstrap/revenue check:",e);}
  },60000);
}
