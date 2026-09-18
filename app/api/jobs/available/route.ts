import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
export async function GET(){
 const {userId}=await auth();if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true,haulerProfile:{select:{id:true,acceptingLoads:true}}}});
 if(!user)return NextResponse.json({error:"Account not provisioned."},{status:403});
 if(user.role!=="HAULER"||!user.haulerProfile)return NextResponse.json({error:"Contractor access required."},{status:403});
 if(!user.haulerProfile.acceptingLoads)return NextResponse.json({jobs:[],message:"Your contractor account is not accepting loads."});
 const jobs=await db.job.findMany({where:{status:{in:["POSTED","BIDDING"]},haulerId:null,NOT:{exclusions:{some:{haulerId:user.haulerProfile.id}}}},orderBy:{createdAt:"desc"},take:100,select:{id:true,jobNumber:true,status:true,jobTypes:true,questionnaire:true,whatToExpect:true,numStories:true,city:true,zipCode:true,arrivalType:true,date:true,time:true,timezone:true,scheduledAt:true,beforePhotoUrl:true,createdAt:true,estimates:{where:{haulerId:user.haulerProfile.id},select:{id:true,amountCents:true,arrival:true,message:true,status:true,createdAt:true}}}});
 return NextResponse.json({jobs});
}