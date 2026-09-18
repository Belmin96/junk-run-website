import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

function csv(value: unknown) {
  const s = String(value ?? "");
  return '"' + s.replace(/"/g, '""') + '"';
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
  const now = new Date();
  const start = period === "year"
    ? new Date(now.getFullYear(), 0, 1)
    : period === "week"
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
      : new Date(now.getFullYear(), now.getMonth(), 1);

  const jobs = await db.job.findMany({
    where: { haulerId: user.haulerProfile.id, updatedAt: { gte: start } },
    orderBy: { updatedAt: "desc" },
    select: {
      jobNumber: true, status: true, city: true, date: true, time: true,
      priceCents: true, haulerPayoutCents: true, refundAmountCents: true,
      paymentStatus: true, completedAt: true, cancelledAt: true,
      cancellationReason: true, updatedAt: true,
    },
  });

  const rows = [
    ["Job Number","Status","City","Date","Time","Earnings","Refund","Payment Status","Completed At","Cancelled At","Cancellation Reason"],
    ...jobs.map(j => [
      j.jobNumber, j.status, j.city, j.date, j.time || "",
      ((j.haulerPayoutCents || 0) / 100).toFixed(2),
      ((j.refundAmountCents || 0) / 100).toFixed(2),
      j.paymentStatus, j.completedAt?.toISOString() || "", j.cancelledAt?.toISOString() || "",
      j.cancellationReason || "",
    ]),
  ];
  const body = rows.map(row => row.map(csv).join(",")).join("\r\n") + "\r\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="junk-run-earnings-' + period + '.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
