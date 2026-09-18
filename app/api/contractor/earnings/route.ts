import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

function rangeStart(period: string) {
  const now = new Date();
  if (period === "week") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, haulerProfile: { select: { id: true } } },
  });
  if (!user || user.role !== "HAULER" || !user.haulerProfile) {
    return NextResponse.json({ error: "Contractor access required." }, { status: 403 });
  }

  const period = new URL(req.url).searchParams.get("period") || "month";
  const start = rangeStart(period);
  const jobs = await db.job.findMany({
    where: { haulerId: user.haulerProfile.id, updatedAt: { gte: start } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, jobNumber: true, status: true, city: true, date: true, time: true,
      priceCents: true, haulerPayoutCents: true, refundAmountCents: true,
      paymentStatus: true, cancelledAt: true, cancellationReason: true,
      completedAt: true, updatedAt: true,
    },
  });

  const completed = jobs.filter(j => j.status === "COMPLETED");
  const cancelled = jobs.filter(j => j.status === "CANCELLED");
  const refunds = jobs.reduce((n, j) => n + (j.refundAmountCents || 0), 0);
  const earnings = completed.reduce((n, j) => n + (j.haulerPayoutCents || 0), 0);
  // Stripe processing fees are intentionally not inferred from payment amounts.
  // The Stripe integration can populate a recorded fee later; Junk Run platform
  // fees and manually entered expenses are never included in this dashboard.
  const processingFees = 0;
  const net = Math.max(0, earnings - refunds - processingFees);

  return NextResponse.json({
    period,
    totals: {
      earningsCents: earnings,
      completedJobs: completed.length,
      cancelledJobs: cancelled.length,
      refundsCents: refunds,
      processingFeesCents: processingFees,
      netEarningsCents: net,
      processingFeesRecorded: false,
    },
    jobs: jobs.map(j => ({
      id: j.id,
      jobNumber: j.jobNumber,
      status: j.status,
      city: j.city,
      date: j.date,
      time: j.time,
      amountCents: j.haulerPayoutCents || 0,
      refundCents: j.refundAmountCents || 0,
      paymentStatus: j.paymentStatus,
      completedAt: j.completedAt,
      cancelledAt: j.cancelledAt,
      cancellationReason: j.cancellationReason,
      updatedAt: j.updatedAt,
    })),
  });
}
