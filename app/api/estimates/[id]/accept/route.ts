import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true}});if(!user)return NextResponse.json({error:"Account not provisioned."},{status:403});
 if(user.role!=="CUSTOMER")return NextResponse.json({error:"Only customers can accept estimates."},{status:403});
 const result=await db.$transaction(async tx=>{
  const estimate=await tx.estimate.findUnique({where:{id},include:{job:{select:{id: true,customerId:true,status:true,haulerId:true}}}});
  if(!estimate||estimate.job.customerId!==user.id)return {error:"NOT_FOUND"};
  if(estimate.job.haulerId||!["POSTED","BIDDING"].includes(estimate.job.status))return {error:"JOB_UNAVAILABLE"};
  const updatedJob=await tx.job.updateMany({where:{id:estimate.job.id,customerId:user.id,haulerId:null,status:{in:["POSTED","BIDDING"]}},data:{haulerId:estimate.haulerId,priceCents:estimate.amountCents,acceptedAt:new Date(),status:"AWARDED"}});
  if(updatedJob.count!==1)return {error:"JOB_UNAVAILABLE"};
  await tx.estimate.update({where:{id},data:{status:"ACCEPTED"}});
  await tx.estimate.updateMany({where:{jobId:estimate.job.id,id:{not:id},status:"PENDING"},data:{status:"DECLINED"}});
  await tx.auditLog.create({data:{actorUserId:user.id,action:"ESTIMATE_ACCEPTED",entityType:"ESTIMATE",entityId:id,jobId:estimate.job.id,metadata:JSON.stringify({haulerId:estimate.haulerId,amountCents:estimate.amountCents})}});
  return {jobId:estimate.job.id};
 });
 if("error" in result)return NextResponse.json({error:result.error==="NOT_FOUND"?"Estimate not found.":"Job is no longer available."},{status:result.error==="NOT_FOUND"?404:409});
 return NextResponse.json({accepted:true,jobId:result.jobId,message:"Estimate accepted. Please continue in the Junk Run app."});
}