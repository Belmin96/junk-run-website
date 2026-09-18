import fs from "node:fs";
const mustExist=["middleware.ts","app/api/app-only/[...path]/route.ts","app/api/jobs/public/route.ts","app/api/jobs/available/route.ts","app/api/estimates/route.ts","app/api/estimates/[id]/accept/route.ts","app/api/messages/route.ts","app/api/admin/route.ts"];
for(const p of mustExist)if(!fs.existsSync(p))throw new Error("Missing security-critical file: "+p);
const checks=[
["public jobs","app/api/jobs/public/route.ts",["pickupAddress","pickupLatitude","pickupLongitude","customerId","estimates","phone"]],
["contractor available jobs","app/api/jobs/available/route.ts",["pickupAddress","pickupLatitude","pickupLongitude","customerId"]],
["app-only gate","app/api/app-only/[...path]/route.ts",["This action is available in the Junk Run mobile app."]],
["admin gate","app/api/admin/route.ts",["role!=='ADMIN'","role!==\"ADMIN\"","role !== \"ADMIN\""]],
["message participant gate","app/api/messages/route.ts",["customerId","haulerProfile?.id"]]
];
for(const [name,file,banned] of checks){const s=fs.readFileSync(file,"utf8");if(name==="app-only gate"&&!s.includes(banned[0]))throw new Error("App-only protection missing");if(name==="admin gate"&&!banned.some(x=>s.includes(x)))throw new Error("Admin authorization check missing");if(name==="message participant gate"&&!banned.every(x=>s.includes(x)))throw new Error("Messaging authorization check missing");if(name.includes("jobs")&&banned.some(x=>s.includes(x)))throw new Error(name+" exposes a private field: "+banned.find(x=>s.includes(x)));}
for(const file of ["app/api/jobs/public/route.ts","app/api/jobs/available/route.ts","app/api/contractors/[id]/route.ts"]){const s=fs.readFileSync(file,"utf8");if(/stripe_(?:secret|key)|sk_live_|sk_test_/i.test(s))throw new Error("Stripe secret material found in public-facing code: "+file);}
console.log("Static security boundary checks passed.");
