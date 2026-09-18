import {NextResponse} from "next/server";
import {db} from "@/lib/db";
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const profile=await db.haulerProfile.findUnique({where:{id},select:{id:true,companyName:true,bio:true,serviceArea:true,vehicleType:true,operatingHours:true,acceptingLoads:true,verified:true,rating:true,jobCount:true,createdAt:true,user:{select:{name:true}}}});
 if(!profile)return NextResponse.json({error:"Not found"},{status:404});
 return NextResponse.json(profile);
}