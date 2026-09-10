import fs from "node:fs";
import path from "node:path";
import { createPublicClient,createWalletClient,formatEther,formatUnits,http,parseUnits,type Address,type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain,rpcUrl,usdcAddress,treasuryAddress,agentReserveUsdc } from "./config.js";
import { loadAgentPrivateKey } from "./wallet.js";

const erc20Abi=[
 {type:"function",name:"balanceOf",stateMutability:"view",inputs:[{name:"account",type:"address"}],outputs:[{name:"",type:"uint256"}]},
 {type:"function",name:"transfer",stateMutability:"nonpayable",inputs:[{name:"to",type:"address"},{name:"amount",type:"uint256"}],outputs:[{name:"",type:"bool"}]}
] as const;
export function clients(){const account=privateKeyToAccount(loadAgentPrivateKey());const transport=http(rpcUrl);return {account,publicClient:createPublicClient({chain,transport}),walletClient:createWalletClient({account,chain,transport})};}
export async function walletSnapshot(address?:Address){const {account,publicClient}=clients();const target=address??account.address;const [native,usdc]=await Promise.all([publicClient.getBalance({address:target}),publicClient.readContract({address:usdcAddress,abi:erc20Abi,functionName:"balanceOf",args:[target]}).catch(()=>0n)]);return {network:chain.name,chainId:chain.id,address:target,nativeBalance:formatEther(native),usdcBalance:formatUnits(usdc,6)};}
export async function treasurySnapshot(){if(!treasuryAddress)return null;return walletSnapshot(treasuryAddress);}
export type CompiledContract={abi:any[];bytecode:Hex};
export function loadArtifact(contractName:string):CompiledContract{const p=path.resolve("artifacts",`${contractName}.json`);if(!fs.existsSync(p))throw new Error(`Missing ${p}. Run npm run compile`);const parsed=JSON.parse(fs.readFileSync(p,"utf8"));return {abi:parsed.abi,bytecode:parsed.bytecode as Hex};}
export async function deployContract(contractName:string,args:readonly unknown[]){const {account,publicClient,walletClient}=clients();const artifact=loadArtifact(contractName);const txHash=await walletClient.deployContract({abi:artifact.abi,bytecode:artifact.bytecode,args,account});const receipt=await publicClient.waitForTransactionReceipt({hash:txHash});if(!receipt.contractAddress)throw new Error("Deployment receipt has no contract address.");return {address:receipt.contractAddress as Address,txHash,blockNumber:receipt.blockNumber};}
export async function sweepExcessUsdc(){if(!treasuryAddress)return {swept:0,reason:"TREASURY_ADDRESS missing"};const {account,publicClient,walletClient}=clients();const balance=await publicClient.readContract({address:usdcAddress,abi:erc20Abi,functionName:"balanceOf",args:[account.address]});const reserve=parseUnits(agentReserveUsdc.toFixed(6),6);if(balance<=reserve)return {swept:0,balance:formatUnits(balance,6)};const amount=balance-reserve;const txHash=await walletClient.writeContract({address:usdcAddress,abi:erc20Abi,functionName:"transfer",args:[treasuryAddress,amount],account});await publicClient.waitForTransactionReceipt({hash:txHash});return {swept:Number(formatUnits(amount,6)),txHash};}
export { parseUnits };
