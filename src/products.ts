import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { keccak256,stringToHex } from "viem";
import { dataDir } from "./config.js";
const productsPath=path.join(dataDir,"products.json"),ordersPath=path.join(dataDir,"orders.json"),salesPath=path.join(dataDir,"sales.json");
export type ProductFormat="markdown"|"text"|"html"|"json"|"csv";
export type Product={id:string;slug:string;title:string;description:string;priceUsd:number;content:string;format:ProductFormat;language:string;targetMarket:string;tags:string[];active:boolean;createdAt:string;updatedAt:string};
export type Order={orderId:`0x${string}`;secret:string;productId:string;createdAt:string};
export type Sale={externalId:string;txHash:string;orderId:string;productId:string;grossUsd:number;treasuryUsd:number;agentUsd:number;at:string};
function readJson<T>(p:string,fallback:T):T{fs.mkdirSync(dataDir,{recursive:true});if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify(fallback,null,2));return JSON.parse(fs.readFileSync(p,"utf8"));}
function writeJson(p:string,v:unknown){fs.writeFileSync(p,JSON.stringify(v,null,2));}
export function productIdFromSlug(slug:string){return keccak256(stringToHex(slug));}
export function listProducts():Product[]{return readJson<Product[]>(productsPath,[]);}
export function getProduct(idOrSlug:string){return listProducts().find(p=>p.id===idOrSlug||p.slug===idOrSlug);}
export function saveProduct(input:Omit<Product,"id"|"createdAt"|"updatedAt">):Product{const all=listProducts(),existing=all.find(p=>p.slug===input.slug),now=new Date().toISOString();const product={id:productIdFromSlug(input.slug),createdAt:existing?.createdAt??now,updatedAt:now,...input};const ix=all.findIndex(p=>p.id===product.id);if(ix>=0)all[ix]=product;else all.push(product);writeJson(productsPath,all);return product;}
export function setProductActive(idOrSlug:string,active:boolean){const all=listProducts(),ix=all.findIndex(p=>p.id===idOrSlug||p.slug===idOrSlug);if(ix<0)throw new Error("Product not found");all[ix].active=active;all[ix].updatedAt=new Date().toISOString();writeJson(productsPath,all);return all[ix];}
export function createOrder(productId:string):Order{const orders=readJson<Order[]>(ordersPath,[]),secret=crypto.randomBytes(32).toString("hex"),orderId=keccak256(stringToHex(secret));const order={orderId,secret,productId,createdAt:new Date().toISOString()};orders.push(order);writeJson(ordersPath,orders);return order;}
export function getOrderBySecret(secret:string){return readJson<Order[]>(ordersPath,[]).find(o=>o.secret===secret);}
export function recordSale(sale:Sale){const all=readJson<Sale[]>(salesPath,[]);if(!all.some(s=>s.externalId===sale.externalId)){all.push(sale);writeJson(salesPath,all);}}
export function salesMetrics(){const sales=readJson<Sale[]>(salesPath,[]),products=listProducts();const byProduct=products.map(p=>{const rows=sales.filter(s=>s.productId.toLowerCase()===p.id.toLowerCase());return {id:p.id,slug:p.slug,title:p.title,language:p.language,targetMarket:p.targetMarket,active:p.active,sales:rows.length,revenueUsd:Number(rows.reduce((a,s)=>a+s.grossUsd,0).toFixed(2))};}).sort((a,b)=>b.revenueUsd-a.revenueUsd);return {totalSales:sales.length,totalRevenueUsd:Number(sales.reduce((a,s)=>a+s.grossUsd,0).toFixed(2)),byProduct};}
