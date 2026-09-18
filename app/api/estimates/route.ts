import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
const Schema=z.object({jobId:z.string().min(1),amountCents:z.number().int().positive().max(100000000),arrival:z.string().trim().max(200).optional(),message:z.string().trim().max(2000).optional()});
async function currentUser(){const {userId}=await auth();if(!userId)return null;return db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true,haulerProfile:{select:{id:true,acceptingLoads:true}}}})}
export async function GET(req:NextRequest){
 const user=await currentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const jobId=new URL(req.url).searchParams.get("jobId");if(!jobId)return NextResponse.json({error:"jobId is required"},{status:400});
 if(user.role==="CUSTOMER"){
  const job=await db.job.findFirst({where:{id:jobId,customerId:user.id},select:{estimates:{orderBy:{amountCents:"asc"},select:{id:true,amountCents:true,arrival:true,message:true,status:true,createdAt:true,hauler:{select:{id:true,companyName:true,rating:true,jobCount:true,serviceArea:true,verified:true,user:{select:{name:true}}}}}}}});
  if(!job)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json(job.estimates);
 }
 if(user.role==="HAULER"&&user.haulerProfile){
  const estimate=await db.estimate.findUnique({where:{jobId_haulerId:{jobId,haulerId:user.haulerProfile.id}},select:{id:true,amountCents:true,arrival:true,message:true,status:true,createdAt:true}});
  return NextResponse.json(estimate?[estimate]:[]);
 }
 return NextResponse.json({error:"Forbidden"},{status:403});
}
export async function POST(req:NextRequest){
 const user=await currentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(user.role!=="HAULER"||!user.haulerProfile)return NextResponse.json({error:"Only contractors can submit estimates."},{status:403});
 if(!user.haulerProfile.acceptingLoads)return NextResponse.json({error:"Your contractor account is not accepting loads."},{status:403});
 const parsed=Schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:422});
 const d=parsed.data;
 const job=await db.job.findUnique({where:{id:d.jobId},select:{id:true,status:true,haulerId:true,customerId:true,exclusions:{where:{haulerId:user.haulerProfile.id},select:{id:true}}}});
 if(!job)return NextResponse.json({error:"Job not found."},{status:404});
 if(job.status!=="POSTED"&&job.status!=="BIDDING")return NextResponse.json({error:"This job is no longer accepting estimates."},{status:409});
 if(job.exclusions.length)return NextResponse.json({error:"You are excluded from this reposted job."},{status:403});
 if(job.haulerId)return NextResponse.json({error:"This job has already been awarded."},{status:409});
 const estimate=await db.estimate.upsert({where:{jobId_haulerId:{jobId:d.jobId,haulerId:user.haulerProfile.id}},create:{jobId:d.jobId,haulerId:user.haulerProfile.id,amountCents:d.amountCents,arrival:d.arrival??null,message:d.message??null,status:"PENDING"},update:{amountCents:d.amountCents,arrival:d.arrival??null,message:d.message??null,status:"PENDING"}});
 await db.auditLog.create({data:{actorUserId:user.id,action:"ESTIMATE_SUBMITTED",entityType:"ESTIMATE",entityId:estimate.id,jobId:d.jobId,metadata:JSON.stringify({amountCents:d.amountCents})}});
 return NextResponse.json(estimate,{status:201});
}