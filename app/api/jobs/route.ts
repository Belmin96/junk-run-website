import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/auth";

const JOB_TYPES = [
  "Furniture",
  "Appliances",
  "Construction Debris",
  "Yard Waste",
  "Mattresses",
  "Electronics",
] as const;

const QUESTIONNAIRE_OPTIONS = {
  propertyTypes: ["House", "Apartment", "Condo", "Townhouse", "Commercial", "Other"],
  jobTypes: [
    "Simple Junk Removal",
    "Garage Clean-Out",
    "Room Clean-Out",
    "Whole-House Clean-Out",
    "Apartment Clean-Out",
    "Estate Clean-Out",
    "Construction Debris",
    "Yard Debris",
    "Other",
  ],
  items: [
    "Furniture",
    "Appliances",
    "Mattresses",
    "Electronics",
    "Yard Waste",
    "Construction Materials",
    "Boxes / General Household Junk",
    "Other",
  ],
  largeHeavyItems: [
    "Refrigerator",
    "Freezer",
    "Piano",
    "Safe",
    "Pool Table",
    "Hot Tub",
    "Large Furniture",
    "Other",
  ],
  junkLocations: [
    "Inside house/apartment",
    "Garage",
    "Basement",
    "Attic",
    "Yard",
    "Curbside",
    "Other",
  ],
  floors: ["Ground", "2nd", "3rd", "4th", "5th+"],
  stairs: ["1", "2", "3", "4+"],
} as const;

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && options.includes(value as T[number]);
}

function isDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTime(value: unknown) {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

function newJobNumber() {
  return `JR-${randomBytes(10).toString("hex").toUpperCase()}`;
}

function validateCreateJob(body: unknown) {
  if (!body || typeof body !== "object") return "Request body must be an object.";
  const data = body as Record<string, unknown>;

  if (
    !Array.isArray(data.jobTypes) ||
    data.jobTypes.length < 1 ||
    data.jobTypes.length > 20 ||
    data.jobTypes.some((x) => !isOneOf(x, JOB_TYPES))
  ) {
    return "Select at least one valid job type.";
  }

  const q = data.questionnaire;
  if (!q || typeof q !== "object") return "A job questionnaire is required.";
  const questionnaire = q as Record<string, unknown>;

  if (!isOneOf(questionnaire.propertyType, QUESTIONNAIRE_OPTIONS.propertyTypes)) return "Invalid property type.";
  if (!isOneOf(questionnaire.jobType, QUESTIONNAIRE_OPTIONS.jobTypes)) return "Invalid questionnaire job type.";
  if (
    !Array.isArray(questionnaire.items) ||
    questionnaire.items.length < 1 ||
    questionnaire.items.length > 8 ||
    questionnaire.items.some((x) => !isOneOf(x, QUESTIONNAIRE_OPTIONS.items))
  ) return "Select at least one valid item type.";

  if (typeof questionnaire.hasLargeHeavyItems !== "boolean") return "Invalid large/heavy item selection.";
  if (
    !Array.isArray(questionnaire.largeHeavyItems) ||
    questionnaire.largeHeavyItems.length > 8 ||
    questionnaire.largeHeavyItems.some((x) => !isOneOf(x, QUESTIONNAIRE_OPTIONS.largeHeavyItems)) ||
    (questionnaire.hasLargeHeavyItems && questionnaire.largeHeavyItems.length === 0) ||
    (!questionnaire.hasLargeHeavyItems && questionnaire.largeHeavyItems.length > 0)
  ) return "Large/heavy item details are invalid.";

  if (typeof questionnaire.hasStairs !== "boolean") return "Invalid stairs selection.";
  if (
    questionnaire.stairs !== null &&
    !isOneOf(questionnaire.stairs, QUESTIONNAIRE_OPTIONS.stairs)
  ) return "Invalid stairs selection.";
  if (questionnaire.hasStairs && !questionnaire.stairs) return "Select the number of flights.";
  if (!questionnaire.hasStairs && questionnaire.stairs) return "Stairs must be empty when none are reported.";

  if (typeof questionnaire.elevator !== "boolean") return "Invalid elevator selection.";
  if (!isOneOf(questionnaire.junkLocation, QUESTIONNAIRE_OPTIONS.junkLocations)) return "Invalid junk location.";
  if (!isOneOf(questionnaire.floor, QUESTIONNAIRE_OPTIONS.floors)) return "Invalid floor.";
  if (typeof questionnaire.hasHazardousMaterials !== "boolean") return "Invalid hazardous-material selection.";
  if (typeof questionnaire.hazardousAcknowledged !== "boolean") return "Invalid hazardous-material acknowledgement.";
  if (questionnaire.hasHazardousMaterials && !questionnaire.hazardousAcknowledged) {
    return "Hazardous/prohibited materials must be acknowledged before posting.";
  }

  if (!Number.isInteger(data.numStories) || Number(data.numStories) < 1 || Number(data.numStories) > 10) {
    return "Number of stories must be between 1 and 10.";
  }
  for (const [key, min, max] of [
    ["pickupAddress", 5, 300],
    ["city", 2, 100],
    ["zipCode", 5, 10],
  ] as const) {
    if (typeof data[key] !== "string" || data[key].trim().length < min || data[key].trim().length > max) {
      return `Invalid ${key}.`;
    }
  }
  if (!/^\d{5}(?:-\d{4})?$/.test(String(data.zipCode).trim())) return "Invalid ZIP code.";
  if (!isOneOf(data.arrivalType, ["SET_TIME", "ANYTIME"] as const)) return "Invalid pickup type.";
  if (!isDate(data.date)) return "Invalid pickup date.";
  if (data.arrivalType === "SET_TIME" && !isTime(data.time)) return "A pickup time is required.";
  if (data.arrivalType === "ANYTIME" && data.time !== undefined && data.time !== null && data.time !== "") {
    return "Anytime pickups cannot include a pickup time.";
  }
  if (data.timezone !== undefined && data.timezone !== null && (typeof data.timezone !== "string" || data.timezone.length > 100)) {
    return "Invalid timezone.";
  }
  if (typeof data.beforePhotoUrl !== "string" || data.beforePhotoUrl.length > 2048) return "A valid before-photo URL is required.";
  try {
    new URL(data.beforePhotoUrl);
  } catch {
    return "A valid before-photo URL is required.";
  }

  if (data.whatToExpect !== undefined && data.whatToExpect !== null && (typeof data.whatToExpect !== "string" || data.whatToExpect.trim().length > 2000)) {
    return "Job description is too long.";
  }

  if (
    (data.pickupLatitude !== undefined && typeof data.pickupLatitude !== "number") ||
    (data.pickupLongitude !== undefined && typeof data.pickupLongitude !== "number")
  ) return "Pickup coordinates are invalid.";
  if (typeof data.pickupLatitude === "number" && (data.pickupLatitude < -90 || data.pickupLatitude > 90)) return "Pickup latitude is invalid.";
  if (typeof data.pickupLongitude === "number" && (data.pickupLongitude < -180 || data.pickupLongitude > 180)) return "Pickup longitude is invalid.";
  if ((data.pickupLatitude === undefined) !== (data.pickupLongitude === undefined)) return "Pickup latitude and longitude must be provided together.";

  if (data.scheduledAtIso !== undefined) {
    if (typeof data.scheduledAtIso !== "string") return "Invalid scheduled timestamp.";
    if (data.arrivalType !== "SET_TIME") return "Scheduled timestamp is only valid for timed pickups.";
    const scheduled = new Date(data.scheduledAtIso);
    if (Number.isNaN(scheduled.getTime())) return "Invalid scheduled timestamp.";
  }

  return null;
}

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "CUSTOMER") {
    const jobs = await db.job.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobNumber: true,
        status: true,
        jobTypes: true,
        questionnaire: true,
        whatToExpect: true,
        numStories: true,
        pickupAddress: true,
        city: true,
        zipCode: true,
        arrivalType: true,
        date: true,
        time: true,
        timezone: true,
        scheduledAt: true,
        beforePhotoUrl: true,
        afterPhotoUrl: true,
        priceCents: true,
        paymentStatus: true,
        acceptedAt: true,
        completedAt: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { estimates: true } },
      },
    });
    return NextResponse.json(jobs);
  }
  if (user.role === "HAULER") {
    const profile = await db.haulerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json([]);
    const jobs = await db.job.findMany({
      where: { status: "POSTED", NOT: { exclusions: { some: { haulerId: profile.id } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        jobNumber: true,
        status: true,
        jobTypes: true,
        questionnaire: true,
        whatToExpect: true,
        numStories: true,
        city: true,
        arrivalType: true,
        date: true,
        time: true,
        scheduledAt: true,
        beforePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
        estimates: {
          where: { haulerId: profile.id },
          select: { id: true, amountCents: true, arrival: true, message: true, status: true, createdAt: true },
        },
      },
    });
    return NextResponse.json(jobs);
  }
  if (user.role === "ADMIN") {
    const jobs = await db.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, jobNumber: true, status: true, customerId: true, haulerId: true, city: true, date: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(jobs);
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "CUSTOMER") return NextResponse.json({ error: "Only customers can post jobs" }, { status: 403 });
  if (!user.paymentVerified) {
    return NextResponse.json(
      { error: "Add a verified payment method before posting a job", code: "PAYMENT_UNVERIFIED" },
      { status: 402 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationError = validateCreateJob(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 422 });

  const data = body as Record<string, any>;
  const scheduledAt = data.scheduledAtIso
    ? new Date(data.scheduledAtIso)
    : new Date(`${data.date}T${data.time ?? "23:59"}:00`);

  if (Number.isNaN(scheduledAt.getTime())) return NextResponse.json({ error: "Invalid pickup date/time" }, { status: 422 });
  if (data.arrivalType === "SET_TIME" && scheduledAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Pickup time must be in the future" }, { status: 422 });
  }

  let job: { id: string; jobNumber: string; scheduledAt: Date; timezone: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      job = await db.$transaction(async (tx) => {
        const createdJob = await tx.job.create({
          data: {
            jobNumber: newJobNumber(),
            customerId: user.id,
            jobTypes: JSON.stringify(data.jobTypes),
            questionnaire: data.questionnaire,
            whatToExpect: typeof data.whatToExpect === "string" ? data.whatToExpect.trim() || null : null,
            numStories: Number(data.numStories),
            pickupAddress: data.pickupAddress.trim(),
            city: data.city.trim(),
            zipCode: data.zipCode.trim(),
            arrivalType: data.arrivalType,
            date: data.date,
            time: data.arrivalType === "SET_TIME" ? data.time : null,
            timezone: typeof data.timezone === "string" ? data.timezone.trim() : "UTC",
            scheduledAt,
            pickupLatitude: data.pickupLatitude,
            pickupLongitude: data.pickupLongitude,
            beforePhotoUrl: data.beforePhotoUrl,
            status: "POSTED",
            paymentStatus: "PENDING",
          },
        });
        await tx.jobPhoto.create({
          data: {
            jobId: createdJob.id,
            userId: user.id,
            kind: "BEFORE_CUSTOMER",
            photoUrl: data.beforePhotoUrl,
            capturedAt: new Date(),
            captureSource: "CUSTOMER_SUBMITTED_WEB",
          },
        });
        return createdJob;
      });
      break;
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: unknown }).code
          : undefined;
      const target =
        typeof error === "object" && error !== null && "meta" in error
          ? (error as { meta?: { target?: unknown } }).meta?.target
          : undefined;
      const isCollision =
        code === "P2002" &&
        (target === "jobNumber" || (Array.isArray(target) && target.includes("jobNumber")));
      if (!isCollision || attempt === 2) {
        console.error("Failed to create job:", error);
        return NextResponse.json({ error: "Unable to create job" }, { status: 500 });
      }
    }
  }

  if (!job) return NextResponse.json({ error: "Unable to create job" }, { status: 500 });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "JOB_CREATED",
      entityType: "JOB",
      entityId: job.id,
      jobId: job.id,
      metadata: JSON.stringify({
        timezone: job.timezone,
        scheduledAt: job.scheduledAt.toISOString(),
        questionnaire: data.questionnaire,
        beforePhotoEvidenceId: "created-with-job",
      }),
    },
  });

  const profiles = await db.haulerProfile.findMany({
    where: { acceptingLoads: true },
    select: { userId: true },
  });
  if (profiles.length) {
    await db.notification.createMany({
      data: profiles.map((profile) => ({
        userId: profile.userId,
        type: "JOB_POSTED",
        title: "New Junk Run job",
        body: `${job.jobNumber} is available in ${data.city.trim()}.`,
        jobId: job.id,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ jobId: job.id, jobNumber: job.jobNumber }, { status: 201 });
}
