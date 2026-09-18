import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      role: true,
      haulerProfile: { select: { id: true, acceptingLoads: true, companyName: true } },
    },
  });

  if (!user || user.role !== "HAULER" || !user.haulerProfile) {
    return NextResponse.json({ error: "Contractor access required." }, { status: 403 });
  }

  const haulerId = user.haulerProfile.id;

  const [availableLoads, submittedEstimates, wonJobs] = await Promise.all([
    db.job.findMany({
      where: {
        status: { in: ["POSTED", "BIDDING"] },
        haulerId: null,
        NOT: { exclusions: { some: { haulerId } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, jobNumber: true, status: true, jobTypes: true,
        whatToExpect: true, numStories: true, city: true, zipCode: true,
        arrivalType: true, date: true, time: true, timezone: true,
        scheduledAt: true, createdAt: true,
        estimates: {
          where: { haulerId },
          select: { id: true, amountCents: true, arrival: true, message: true, status: true, createdAt: true },
        },
      },
    }),
    db.estimate.findMany({
      where: { haulerId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, jobId: true, amountCents: true, arrival: true,
        message: true, status: true, createdAt: true,
        job: {
          select: {
            id: true, jobNumber: true, status: true, jobTypes: true,
            city: true, date: true, time: true, timezone: true,
          },
        },
      },
    }),
    db.job.findMany({
      where: { haulerId },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true, jobNumber: true, status: true, jobTypes: true,
        pickupAddress: true, city: true, zipCode: true,
        date: true, time: true, timezone: true, scheduledAt: true,
        priceCents: true, paymentStatus: true, acceptedAt: true,
        cancelledAt: true, cancellationReason: true, completedAt: true,
        createdAt: true, updatedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    contractor: user.haulerProfile,
    availableLoads,
    submittedEstimates,
    wonJobs,
  });
}
