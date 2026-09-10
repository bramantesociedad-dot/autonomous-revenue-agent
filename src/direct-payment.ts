import { createPublicClient, http, encodeFunctionData, decodeEventLog, parseUnits, formatUnits, type Address, type Hex } from "viem";
import { chain, rpcUrl, treasuryAddress, usdcAddress } from "./config.js";
import { getOrderBySecret, markOrderPaid, txAlreadyUsed, recordSale, getProduct } from "./products.js";
import { appendLedger } from "./ledger.js";

const erc20Abi = [
  {type:"function",name:"transfer",stateMutability:"nonpayable",inputs:[{name:"to",type:"address"},{name:"amount",type:"uint256"}],outputs:[{name:"",type:"bool"}]},
  {type:"event",name:"Transfer",inputs:[{name:"from",type:"address",indexed:true},{name:"to",type:"address",indexed:true},{name:"value",type:"uint256",indexed:false}],anonymous:false}
] as const;

const publicClient=createPublicClient({chain,transport:http(rpcUrl)});

export function directCheckoutCalldata(priceUsd:number){
  if(!treasuryAddress) throw new Error("TREASURY_ADDRESS missing");
  const amount=parseUnits(priceUsd.toFixed(6),6);
  const data=encodeFunctionData({abi:erc20Abi,functionName:"transfer",args:[treasuryAddress,amount]});
  return {to:usdcAddress,data,amount:amount.toString(),treasuryAddress};
}

export async function verifyDirectPayment(secret:string,txHash:Hex){
  const order=getOrderBySecret(secret);
  if(!order) throw new Error("Order not found");
  if(order.paid) return {ok:true,alreadyPaid:true,txHash:order.txHash};
  if(txAlreadyUsed(txHash)) throw new Error("Transaction already used for another order");
  if(!treasuryAddress) throw new Error("Treasury not configured");
  if(!order.payer) throw new Error("Order payer missing");
  const receipt=await publicClient.getTransactionReceipt({hash:txHash});
  if(receipt.status!=="success") throw new Error("Transaction failed");
  const block=await publicClient.getBlock({blockNumber:receipt.blockNumber});
  const orderMs=new Date(order.createdAt).getTime();
  const blockMs=Number(block.timestamp)*1000;
  if(blockMs < orderMs-300_000) throw new Error("Transaction predates order");
  const expected=parseUnits(Number(order.amountUsd||0).toFixed(6),6);
  let matched=0n;
  for(const log of receipt.logs){
    if(log.address.toLowerCase()!==usdcAddress.toLowerCase()) continue;
    try{
      const decoded=decodeEventLog({abi:erc20Abi,data:log.data,topics:log.topics});
      if(decoded.eventName!=="Transfer") continue;
      const a=decoded.args as any;
      if(String(a.from).toLowerCase()===order.payer.toLowerCase() && String(a.to).toLowerCase()===treasuryAddress.toLowerCase()) matched+=BigInt(a.value);
    }catch{}
  }
  if(matched<expected) throw new Error(`Payment not found. Expected ${formatUnits(expected,6)} USDC`);
  const paid=markOrderPaid(secret,txHash);
  const product=getProduct(order.productId);
  const gross=Number(formatUnits(matched,6));
  const externalId=txHash.toLowerCase();
  recordSale({externalId,txHash,orderId:order.orderId,productId:order.productId,grossUsd:gross,treasuryUsd:gross,agentUsd:0,at:new Date().toISOString()});
  appendLedger({kind:"revenue",usd:gross,label:`Pilot direct USDC sale: ${product?.title||order.productId}`,txHash,externalId,productId:order.productId,market:product?.targetMarket,language:product?.language});
  return {ok:true,paid,grossUsd:gross};
}
