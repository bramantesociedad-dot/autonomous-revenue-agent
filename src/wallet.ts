import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { dataDir } from "./config.js";

const walletPath = path.join(dataDir, "agent-wallet.enc.json");
const localMasterKeyPath = path.join(dataDir, ".wallet-master.key");
function mkdir(){ fs.mkdirSync(dataDir,{recursive:true}); }
function deriveKey(input:Buffer|string){ return crypto.createHash("sha256").update(input).digest(); }
function masterKey():Buffer{
  mkdir();
  const env=process.env.WALLET_MASTER_KEY;
  if(env&&env.length>=16)return deriveKey(env);
  if(fs.existsSync(localMasterKeyPath))return deriveKey(fs.readFileSync(localMasterKeyPath));
  const raw=crypto.randomBytes(32);
  fs.writeFileSync(localMasterKeyPath,raw.toString("hex"),{mode:0o600});
  console.log("[wallet] Generated persistent local wallet master key.");
  return deriveKey(raw.toString("hex"));
}
function encrypt(secret:string){
  const key=masterKey(),iv=crypto.randomBytes(12),cipher=crypto.createCipheriv("aes-256-gcm",key,iv);
  const ciphertext=Buffer.concat([cipher.update(secret,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return {v:1,alg:"aes-256-gcm",iv:iv.toString("base64"),tag:tag.toString("base64"),ciphertext:ciphertext.toString("base64")};
}
function decrypt(payload:any):string{
  const decipher=crypto.createDecipheriv("aes-256-gcm",masterKey(),Buffer.from(payload.iv,"base64"));
  decipher.setAuthTag(Buffer.from(payload.tag,"base64"));
  return Buffer.concat([decipher.update(Buffer.from(payload.ciphertext,"base64")),decipher.final()]).toString("utf8");
}
export function ensureAgentWallet(){
  mkdir();
  if(process.env.PRIVATE_KEY){const pk=(process.env.PRIVATE_KEY.startsWith("0x")?process.env.PRIVATE_KEY:`0x${process.env.PRIVATE_KEY}`) as Hex;return {address:privateKeyToAccount(pk).address,created:false,source:"environment" as const};}
  if(!fs.existsSync(walletPath)){
    const privateKey=generatePrivateKey();fs.writeFileSync(walletPath,JSON.stringify(encrypt(privateKey),null,2),{mode:0o600});
    const address=privateKeyToAccount(privateKey).address;console.log(`[wallet] New autonomous agent wallet created: ${address}`);return {address,created:true,source:"encrypted-volume" as const};
  }
  const pk=decrypt(JSON.parse(fs.readFileSync(walletPath,"utf8"))) as Hex;return {address:privateKeyToAccount(pk).address,created:false,source:"encrypted-volume" as const};
}
export function loadAgentPrivateKey():Hex{
  if(process.env.PRIVATE_KEY)return (process.env.PRIVATE_KEY.startsWith("0x")?process.env.PRIVATE_KEY:`0x${process.env.PRIVATE_KEY}`) as Hex;
  if(!fs.existsSync(walletPath))ensureAgentWallet();return decrypt(JSON.parse(fs.readFileSync(walletPath,"utf8"))) as Hex;
}
export function exportAgentPrivateKey():Hex{return loadAgentPrivateKey();}
