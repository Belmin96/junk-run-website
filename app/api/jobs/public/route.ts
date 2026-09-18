import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimit} from "@/lib/rate-limit";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown";
 const rl=rateLimit("public-jobs:"+ip,120,60000);
 if(!rl.ok)return NextResponse.json({error:"Too many requests."},{status:429,headers:{"Retry-After":String(rl.retryAfterSeconds??60)}});
 const jobs=await db.job.findMany({where:{status:"POSTED"},select:{id:true,jobNumber:true,jobTypes:true,city:true,date:true,time:true,whatToExpect:true,createdAt:true},orderBy:{createdAt:"desc"},take:50});
 return NextResponse.json({jobs});
}