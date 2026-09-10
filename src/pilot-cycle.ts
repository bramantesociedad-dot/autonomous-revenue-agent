import { seedPilotProducts } from "./pilot-products.js";
import { salesMetrics, listProducts } from "./products.js";
import { appendLedger } from "./ledger.js";

export async function runPilotCycle(){
  seedPilotProducts();
  const metrics=salesMetrics();
  const products=listProducts();
  const winner=metrics.byProduct[0];
  const now=new Date().toISOString();
  const decision=winner && winner.sales>0
    ? `SCALE ${winner.slug}: ${winner.sales} paid sales / $${winner.revenueUsd.toFixed(2)} revenue.`
    : `HOLD pilot inventory: ${products.filter(p=>p.active).length} active products; waiting for paid-sales evidence before changing the catalog.`;
  appendLedger({kind:"note",usd:0,label:`Pilot cycle ${now} — ${decision}`});
  console.log("[pilot]",decision);
  return {decision,metrics};
}
