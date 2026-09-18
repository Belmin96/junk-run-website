import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
export const runtime="nodejs";
export async function GET(){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true,haulerProfile:{select:{id:true}}}});
 if(!user)return NextResponse.json({error:"Account not provisioned."},{status:403});
 if(user.role==="CUSTOMER"){
  const jobs=await db.job.findMany({where:{customerId:user.id},select:{id:true,jobNumber:true,status:true,jobTypes:true,city:true,date:true,time:true,scheduledAt:true,priceCents:true,paymentStatus:true,acceptedAt:true,cancelledAt:true,cancellationReason:true},orderBy:{createdAt:"desc"}});
  return NextResponse.json({role:user.role,jobs});
 }
 if(user.role==="HAULER"&&user.haulerProfile){
  const jobs=await db.job.findMany({where:{haulerId:user.haulerProfile.id},select:{id:true,jobNumber:true,status:true,jobTypes:true,city:true,date:true,time:true,scheduledAt:true,priceCents:true,paymentStatus:true,acceptedAt:true,completedAt:true,cancelledAt:true},orderBy:{createdAt:"desc"}});
  return NextResponse.json({role:user.role,jobs});
 }
 if(user.role==="ADMIN"){
  const jobs=await db.job.findMany({select:{id:true,jobNumber:true,status:true,jobTypes:true,city:true,date:true,time:true,scheduledAt:true,createdAt:true},orderBy:{createdAt:"desc"},take:100});
  return NextResponse.json({role:user.role,jobs});
 }
 return NextResponse.json({error:"Forbidden"},{status:403});
}