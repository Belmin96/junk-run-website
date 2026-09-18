import { auth } from "@clerk/nextjs/server";
export type AppRole="CUSTOMER"|"HAULER"|"ADMIN";
const ROLES:AppRole[]=["CUSTOMER","HAULER","ADMIN"];
export async function requireUser(){const session=await auth();if(!session.userId)throw new Error("UNAUTHENTICATED");return session;}
export async function requireRole(allowed:AppRole[]){const session=await requireUser();const role=String(session.sessionClaims?.metadata?.role??session.sessionClaims?.publicMetadata?.role??"");if(!ROLES.includes(role as AppRole)||!allowed.includes(role as AppRole))throw new Error("FORBIDDEN");return {...session,role:role as AppRole};}