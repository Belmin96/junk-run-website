import {NextRequest,NextResponse} from "next/server";
const response={error:"This action is available in the Junk Run mobile app."};
export async function GET(_req:NextRequest){return NextResponse.json(response,{status:403})}
export async function POST(_req:NextRequest){return NextResponse.json(response,{status:403})}
export async function PUT(_req:NextRequest){return NextResponse.json(response,{status:403})}
export async function PATCH(_req:NextRequest){return NextResponse.json(response,{status:403})}
export async function DELETE(_req:NextRequest){return NextResponse.json(response,{status:403})}