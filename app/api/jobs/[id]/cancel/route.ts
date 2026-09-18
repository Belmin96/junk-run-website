import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
const Body=z.object({reason:z.string().trim().min(3).max(500)});
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true}});if(!user)return NextResponse.json({error:"Account not provisioned."},{status:403});
 if(user.role!=="CUSTOMER")return NextResponse.json({error:"Only customers can cancel from the website."},{status:403});
 const p=Body.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:422});
 const result=await db.$transaction(async tx=>{
  const job=await tx.job.findFirst({where:{id,customerId:user.id},select:{id:true,status:true}});
  if(!job)return {error:"NOT_FOUND"};if(["COMPLETED","CANCELLED"].includes(job.status))return {error:"CANNOT_CANCEL"};
  const updated=await tx.job.updateMany({where:{id,customerId:user.id,status:{notIn:["COMPLETED","CANCELLED"]}},data:{status:"CANCELLED",cancelledAt:new Date(),cancelledByUserId:user.id,cancellationReason:p.data.reason}});
  if(updated.count!==1)return {error:"CANNOT_CANCEL"};
  await tx.auditLog.create({data:{actorUserId:user.id,action:"JOB_CANCELLED_BY_CUSTOMER",entityType:"JOB",entityId:id,jobId:id,metadata:JSON.stringify({reason:p.data.reason})}});
  return {ok:true};
 });
 if("error" in result)return NextResponse.json({error:result.error==="NOT_FOUND"?"Not found":"Job cannot be cancelled."},{status:result.error==="NOT_FOUND"?404:409});
 return NextResponse.json({cancelled:true});
}