import fs from "node:fs";
import path from "node:path";
import solc from "solc";
const contractsDir=path.resolve("contracts"),artifactsDir=path.resolve("artifacts");fs.mkdirSync(artifactsDir,{recursive:true});
function findImports(importPath:string){for(const candidate of [path.resolve(importPath),path.resolve("node_modules",importPath),path.resolve("contracts",importPath)]){if(fs.existsSync(candidate))return {contents:fs.readFileSync(candidate,"utf8")};}return {error:`Import not found: ${importPath}`};}
const sources:Record<string,{content:string}>={};for(const file of fs.readdirSync(contractsDir)){if(file.endsWith(".sol"))sources[file]={content:fs.readFileSync(path.join(contractsDir,file),"utf8")};}
const input={language:"Solidity",sources,settings:{optimizer:{enabled:true,runs:200},outputSelection:{"*":{"*":["abi","evm.bytecode.object"]}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input),{import:findImports}));if(output.errors){for(const e of output.errors)console.error(e.formattedMessage);if(output.errors.some((e:any)=>e.severity==="error"))process.exit(1);}
for(const [sourceName,contracts] of Object.entries<any>(output.contracts)){for(const [contractName,c] of Object.entries<any>(contracts)){if(!sources[sourceName])continue;fs.writeFileSync(path.join(artifactsDir,`${contractName}.json`),JSON.stringify({contractName,abi:c.abi,bytecode:`0x${c.evm.bytecode.object}`},null,2));console.log(`Compiled ${contractName}`);}}
