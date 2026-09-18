import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export type DbUser = Awaited<ReturnType<typeof getOrCreateDbUser>>;

export async function getOrCreateDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const requestedRole = String(
    (clerkUser.publicMetadata as Record<string, unknown> | undefined)?.role ?? "CUSTOMER"
  );
  const role = requestedRole === "HAULER" || requestedRole === "ADMIN" ? requestedRole : "CUSTOMER";

  try {
    return await db.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        role,
        contractorType: role === "HAULER" ? "INDEPENDENT" : null,
      },
    });
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: unknown }).code
        : undefined;
    if (code === "P2002") {
      return db.user.findUnique({ where: { clerkId: userId } });
    }
    throw error;
  }
}
