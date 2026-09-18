import {NextRequest,NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true,haulerProfile:{select:{id:true}}}});if(!user)return NextResponse.json({error:"Account not provisioned."},{status:403});
 if(user.role==="CUSTOMER"){
  const job=await db.job.findFirst({where:{id,customerId:user.id},select:{id:true,jobNumber:true,status:true,jobTypes:true,questionnaire:true,whatToExpect:true,numStories:true,pickupAddress:true,city:true,zipCode:true,arrivalType:true,date:true,time:true,timezone:true,scheduledAt:true,beforePhotoUrl:true,afterPhotoUrl:true,priceCents:true,paymentStatus:true,acceptedAt:true,cancelledAt:true,cancellationReason:true,completedAt:true}});
  if(!job)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json(job);
 }
 if(user.role==="HAULER"&&user.haulerProfile){
  const job=await db.job.findFirst({where:{id,status:{in:["POSTED","BIDDING"]},haulerId:null,NOT:{exclusions:{some:{haulerId:user.haulerProfile.id}}}},select:{id:true,jobNumber:true,status:true,jobTypes:true,questionnaire:true,whatToExpect:true,numStories:true,city:true,zipCode:true,arrivalType:true,date:true,time:true,timezone:true,scheduledAt:true,beforePhotoUrl:true,createdAt:true,estimates:{where:{haulerId:user.haulerProfile.id},select:{id:true,amountCents:true,arrival:true,message:true,status:true,createdAt:true}}}});
  if(!job)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json(job);
 }
 return NextResponse.json({error:"Forbidden"},{status:403});
}