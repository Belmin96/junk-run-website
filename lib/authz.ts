import { auth } from "@clerk/nextjs/server";
export type AppRole="CUSTOMER"|"HAULER"|"ADMIN";
const ROLES:AppRole[]=["CUSTOMER","HAULER","ADMIN"];
export async function requireUser(){const session=await auth();if(!session.userId)throw new Error("UNAUTHENTICATED");return session;}
export async function requireRole(allowed:AppRole[]){const session=await requireUser();const claims = session.sessionClaims as unknown as { metadata?: Record<string, unknown>; publicMetadata?: Record<string, unknown> };const role=String(claims.metadata?.role??claims.publicMetadata?.role??"");if(!ROLES.includes(role as AppRole)||!allowed.includes(role as AppRole))throw new Error("FORBIDDEN");return {...session,role:role as AppRole};}