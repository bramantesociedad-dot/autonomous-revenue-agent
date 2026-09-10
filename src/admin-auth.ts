import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { dataDir } from "./config.js";
const tokenPath=path.join(dataDir,"admin-token.txt");
export function ensureAdminToken(){fs.mkdirSync(dataDir,{recursive:true});if(process.env.ADMIN_TOKEN)return {token:process.env.ADMIN_TOKEN,generated:false};if(fs.existsSync(tokenPath))return {token:fs.readFileSync(tokenPath,"utf8").trim(),generated:false};const token=crypto.randomBytes(24).toString("hex");fs.writeFileSync(tokenPath,token,{mode:0o600});console.log(`[admin] Generated dashboard token: ${token}`);return {token,generated:true};}
export function requestIsAdmin(req:import("node:http").IncomingMessage){const expected=ensureAdminToken().token;const cookie=req.headers.cookie??"";const match=cookie.match(/(?:^|;\s*)ra_admin=([^;]+)/);if(!match)return false;const a=Buffer.from(match[1]),b=Buffer.from(expected);return a.length===b.length&&crypto.timingSafeEqual(a,b);}
