import {NextRequest,NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true,haulerProfile:{select:{id:true}}}});if(!user)return NextResponse.json({error:"Account not provisioned."},{status:403});
 if(user.role==="CUSTOMER"){
  const job=await db.job.findFirst({where:{id,customerId:user.id},select:{estimates:{orderBy:{amountCents:"asc"},select:{id:true,amountCents:true,arrival:true,message:true,status:true,createdAt:true,hauler:{select:{id:true,companyName:true,bio:true,serviceArea:true,vehicleType:true,verified:true,rating:true,jobCount:true,user:{select:{name:true}}}}}}}});
  if(!job)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json(job.estimates);
 }
 if(user.role==="HAULER"&&user.haulerProfile){
  const estimate=await db.estimate.findUnique({where:{jobId_haulerId:{jobId:id,haulerId:user.haulerProfile.id}},select:{id:true,amountCents:true,arrival:true,message:true,status:true,createdAt:true}});
  return NextResponse.json(estimate?[estimate]:[]);
 }
 return NextResponse.json({error:"Forbidden"},{status:403});
}