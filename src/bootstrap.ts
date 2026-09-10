import { ensureAgentWallet } from "./wallet.js";
import { ensureAdminToken } from "./admin-auth.js";
import { ensureGatewayDeployed,resolvedGatewayAddress } from "./gateway.js";
import { walletSnapshot } from "./blockchain.js";
import { treasuryAddress,pilotMode } from "./config.js";
export async function bootstrapOnce(){
  const wallet=ensureAgentWallet();
  ensureAdminToken();
  const snap=await walletSnapshot().catch(()=>null);
  if(!treasuryAddress){console.log("[bootstrap] TREASURY_ADDRESS is required before checkout can start.");return {wallet,snap,gateway:null,ready:false,pilotMode};}
  if(pilotMode){return {wallet,snap,gateway:null,ready:true,pilotMode};}
  const gateway=await ensureGatewayDeployed();
  const ready=!!resolvedGatewayAddress();
  return {wallet,snap,gateway,ready,pilotMode};
}
