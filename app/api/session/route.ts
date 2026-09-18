import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
export const runtime="nodejs";
export async function GET(){
 const {userId,sessionClaims}=await auth();
 if(!userId)return NextResponse.json({authenticated:false},{status:401});
 const user=await db.user.findUnique({where:{clerkId:userId},select:{id:true,role:true,notificationsEnabled:true}});
 if(!user)return NextResponse.json({error:"Account is not provisioned yet."},{status:403});
 const claimRole=String(sessionClaims?.metadata?.role??sessionClaims?.publicMetadata?.role??"");
 if(claimRole&&claimRole!==user.role)return NextResponse.json({error:"Role synchronization required."},{status:409});
 return NextResponse.json({authenticated:true,user});
}