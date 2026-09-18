"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const jobTypes = ["Simple Junk Removal","Garage Clean-Out","Room Clean-Out","Whole-House Clean-Out","Apartment Clean-Out","Estate Clean-Out","Construction Debris","Yard Debris","Other"];
const items = ["Furniture","Appliances","Mattresses","Electronics","Yard Waste","Construction Materials","Boxes / General Household Junk","Other"];

export default function NewJobPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const hasStairs = f.get("hasStairs") === "on";
    const hasHeavy = f.get("hasHeavy") === "on";
    const arrivalType = f.get("arrivalType") as string;
    const payload = {
      jobTypes: [f.get("jobType") as string],
      questionnaire: {
        propertyType: f.get("propertyType"),
        jobType: f.get("jobType"),
        items: f.getAll("items"),
        hasLargeHeavyItems: hasHeavy,
        largeHeavyItems: hasHeavy ? [f.get("heavyItem")] : [],
        hasStairs,
        stairs: hasStairs ? (f.get("stairs") as string) : null,
        elevator: f.get("elevator") === "on",
        junkLocation: f.get("junkLocation"),
        floor: f.get("floor"),
        hasHazardousMaterials: false,
        hazardousAcknowledged: false,
      },
      whatToExpect: f.get("description"),
      numStories: Number(f.get("numStories") || 1),
      pickupAddress: f.get("address"),
      city: f.get("city"),
      zipCode: f.get("zip"),
      arrivalType,
      date: f.get("date"),
      time: arrivalType === "SET_TIME" ? f.get("time") : undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      beforePhotoUrl: f.get("beforePhotoUrl"),
    };

    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) {
        throw new Error(
          d.code === "PAYMENT_UNVERIFIED"
            ? "A verified payment method is required before posting a job. Add one in the Junk Run app, then return here."
            : typeof d.error === "string"
              ? d.error
              : "Please check the form and try again."
        );
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post job.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <header className="nav">
        <Link href="/" className="brand"><span className="brandMark">JR</span>JUNK RUN</Link>
        <nav className="navlinks"><Link href="/dashboard">Dashboard</Link><Link href="/jobs">Browse</Link></nav>
      </header>
      <section className="section">
        <div className="eyebrow">Customer</div>
        <h1>Post a junk job</h1>
        <p className="sub">Exact address is private and is only shown to the awarded contractor. A verified payment method is required.</p>
        {error && <div className="card" role="alert"><strong>{error}</strong></div>}
        <form className="card form" onSubmit={submit}>
          <label>Pickup address<input name="address" required minLength={5} /></label>
          <div className="two">
            <label>City<input name="city" required /></label>
            <label>ZIP code<input name="zip" required pattern={"\\d{5}(-\\d{4})?"} /></label>
          </div>
          <div className="two">
            <label>Job type<select name="jobType" required>{jobTypes.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Property type<select name="propertyType" required>{["House","Apartment","Condo","Townhouse","Commercial","Other"].map(x => <option key={x}>{x}</option>)}</select></label>
          </div>
          <label>Items<select name="items" multiple required size={4}>{items.map(x => <option key={x}>{x}</option>)}</select></label>
          <div className="two">
            <label>Pickup date<input name="date" type="date" required /></label>
            <label>Pickup type<select name="arrivalType"><option value="SET_TIME">Set time</option><option value="ANYTIME">Anytime</option></select></label>
          </div>
          <label>Pickup time<input name="time" type="time" /></label>
          <label>Description<textarea name="description" rows={4} maxLength={2000} /></label>
          <div className="two">
            <label>Stories<input name="numStories" type="number" min="1" max="10" defaultValue="1" /></label>
            <label>Floor<select name="floor">{["Ground","2nd","3rd","4th","5th+"].map(x => <option key={x}>{x}</option>)}</select></label>
          </div>
          <label>Junk location<select name="junkLocation">{["Inside house/apartment","Garage","Basement","Attic","Yard","Curbside","Other"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="check"><input name="hasStairs" type="checkbox" /> There are stairs</label>
          <label>Flights<select name="stairs">{["1","2","3","4+"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="check"><input name="hasHeavy" type="checkbox" /> Large/heavy item</label>
          <label>Heavy item<select name="heavyItem">{["Refrigerator","Freezer","Piano","Safe","Pool Table","Hot Tub","Large Furniture","Other"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="check"><input name="elevator" type="checkbox" /> Elevator available</label>
          <label>Before-photo URL<input name="beforePhotoUrl" type="url" required placeholder="Photo URL from an approved upload flow" /></label>
          <p className="private">Computer file uploads are intentionally not enabled here. Completion photos and GPS arrival verification remain mobile-app functions.</p>
          <button className="btn primary" disabled={busy}>{busy ? "Posting…" : "Post job"}</button>
        </form>
      </section>
    </main>
  );
}
