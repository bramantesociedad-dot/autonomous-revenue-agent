import fs from "node:fs";
import path from "node:path";
import { formatUnits } from "viem";
import { clients,loadArtifact,sweepExcessUsdc } from "./blockchain.js";
import { requireGateway,resolvedGatewayAddress,gatewayMetadata } from "./gateway.js";
import { appendLedger } from "./ledger.js";
import { recordSale } from "./products.js";
import { dataDir } from "./config.js";
const statePath=path.join(dataDir,"revenue-watcher.json");
function loadState(){const gateway=resolvedGatewayAddress();if(fs.existsSync(statePath)){const s=JSON.parse(fs.readFileSync(statePath,"utf8"));if(s.gateway?.toLowerCase()===gateway?.toLowerCase())return s;}return {gateway,lastBlock:gatewayMetadata()?.blockNumber||"0"};}
function saveState(s:any){fs.mkdirSync(dataDir,{recursive:true});fs.writeFileSync(statePath,JSON.stringify(s,null,2));}
export async function scanRevenueOnce(){if(!resolvedGatewayAddress())return {scanned:false,reason:"gateway not deployed"};const {publicClient}=clients(),artifact=loadArtifact("RevenueGateway"),latest=await publicClient.getBlockNumber(),state=loadState();let from=BigInt(state.lastBlock||"0");if(from>latest)from=latest;const logs=await publicClient.getContractEvents({address:requireGateway(),abi:artifact.abi,eventName:"PaymentReceived",fromBlock:from,toBlock:latest});for(const log of logs as any[]){const gross=Number(formatUnits(log.args.grossAmount,6)),agent=Number(formatUnits(log.args.agentAmount,6)),treasury=Number(formatUnits(log.args.treasuryAmount,6)),productId=String(log.args.productId),orderId=String(log.args.orderId),externalId=`${log.transactionHash}:${log.logIndex}`;appendLedger({kind:"revenue",usd:gross,label:`USDC sale gross=$${gross.toFixed(2)} treasury=$${treasury.toFixed(2)} reinvest=$${agent.toFixed(2)}`,txHash:log.transactionHash,externalId,productId});recordSale({externalId,txHash:log.transactionHash,orderId,productId,grossUsd:gross,treasuryUsd:treasury,agentUsd:agent,at:new Date().toISOString()});}saveState({gateway:resolvedGatewayAddress(),lastBlock:(latest+1n).toString()});let sweep:any=null;try{sweep=await sweepExcessUsdc();if(sweep?.swept>0)appendLedger({kind:"note",usd:0,label:`Swept ${sweep.swept} USDC excess agent reserve to treasury`,txHash:sweep.txHash});}catch(e:any){sweep={error:e?.shortMessage||e?.message||String(e)};}return {scanned:true,events:logs.length,sweep};}
if(import.meta.url===`file://${process.argv[1]}`)console.log(await scanRevenueOnce());
