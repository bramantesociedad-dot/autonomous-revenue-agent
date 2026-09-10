import { ensureAgentWallet } from "./wallet.js";
import { ensureAdminToken } from "./admin-auth.js";
import { ensureGatewayDeployed,resolvedGatewayAddress } from "./gateway.js";
import { walletSnapshot } from "./blockchain.js";
import { treasuryAddress } from "./config.js";
export async function bootstrapOnce(){const wallet=ensureAgentWallet();ensureAdminToken();const snap=await walletSnapshot().catch(()=>null);if(!treasuryAddress){console.log("[bootstrap] TREASURY_ADDRESS is required before real checkout can start.");return {wallet,snap,gateway:null,ready:false};}const gateway=await ensureGatewayDeployed();const ready=!!resolvedGatewayAddress();return {wallet,snap,gateway,ready};}
