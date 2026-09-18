import Link from "next/link";

const steps = [
  { n: "01", title: "Post Your Job", text: "Tell us what needs to go, add photos and details, and choose your pickup date and time." },
  { n: "02", title: "Receive Quotes", text: "Verified contractors send you private quotes. Junk Run is quote-based — not a bidding system." },
  { n: "03", title: "Choose Your Hauler", text: "Review the contractors and their quote, then choose the professional you want." },
  { n: "04", title: "Secure Payment", text: "Your payment is secured through the marketplace and tied to the selected job." },
  { n: "05", title: "Verified Completion", text: "Pickup arrival and completion are verified before the job is closed and payment is released." },
];

const customerPoints = [
  "Post a junk removal job in minutes",
  "Receive quotes from contractors — not bids",
  "Choose the hauler you want",
  "Secure payment and verified completion",
];

const contractorPoints = [
  "See real job opportunities",
  "Send private quotes to customers",
  "Know exactly when your pickup window starts",
  "Build your reputation and get paid securely",
];

export default function Home() {
  return (
    <>
      <header className="container nav">
        <Link href="/" className="brand" aria-label="Junk Run home">
          <span className="brandMark">JR</span>
          <span>JUNK RUN</span>
        </Link>
        <nav className="navlinks" aria-label="Main navigation">
          <Link href="#how">How It Works</Link>
          <Link href="#customers">For Customers</Link>
          <Link href="#contractors">For Contractors</Link>
          <Link href="/jobs">Browse Jobs</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <Link className="btn primary navCta" href="/jobs">Get Started</Link>
      </header>

      <main>
        <section className="hero">
          <div className="heroPhoto" aria-hidden="true" />
          <div className="heroOverlay" aria-hidden="true" />
          <div className="container heroContent">
            <div className="heroCopy">
              <div className="eyebrow">Junk removal made simple</div>
              <h1>GET IT GONE<br /><span>WITH JUNK RUN.</span></h1>
              <p className="heroLead">
                Post your junk removal job, receive quotes from contractors, choose your hauler,
                secure payment, and get verified completion — all in one simple marketplace.
              </p>
              <div className="actions">
                <Link className="btn primary" href="/jobs">Post Your Job →</Link>
                <Link className="btn secondary" href="#how">See How It Works</Link>
              </div>
              <div className="trustRow">
                <span>✓ Secure Payments</span>
                <span>✓ Verified Contractors</span>
                <span>✓ Verified Completion</span>
              </div>
            </div>
          </div>
        </section>

        <section className="quoteBanner">
          <div className="container quoteBannerInner">
            <strong>JUNK RUN IS QUOTE-BASED.</strong>
            <span>Not a bidding system.</span>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <div className="eyebrow">One simple process</div>
            <h2>From junk to gone.</h2>
            <p className="sub">
              Junk Run keeps the process straightforward: customers post a job, contractors send quotes,
              the customer chooses the hauler, payment is secured, and completion is verified.
            </p>
            <div className="steps">
              {steps.map((step) => (
                <article className="step" key={step.n}>
                  <div className="stepNumber">{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt" id="customers">
          <div className="container split">
            <div>
              <div className="eyebrow">For customers</div>
              <h2>A cleaner space is a few clicks away.</h2>
              <p className="sub">
                You stay in control. Tell contractors what you need removed, review their quotes,
                choose your hauler, and use secure marketplace payment.
              </p>
              <ul className="checkList">
                {customerPoints.map((point) => <li key={point}>✓ <span>{point}</span></li>)}
              </ul>
              <Link className="btn primary" href="/jobs">Post Your Job →</Link>
            </div>
            <div className="featurePanel">
              <div className="featureLabel">CUSTOMER PROTECTION</div>
              <div className="featureBig">Secure.</div>
              <div className="featureBig greenText">Simple.</div>
              <div className="featureBig">Verified.</div>
              <p>Your payment workflow is connected to the selected job, while arrival and completion verification protect the process.</p>
            </div>
          </div>
        </section>

        <section className="section" id="contractors">
          <div className="container split contractorSplit">
            <div className="featurePanel pickupPanel">
              <div className="featureLabel">PICKUP WINDOW</div>
              <div className="windowBig">45 MINUTES</div>
              <p>Your pickup window starts at the scheduled date and time.</p>
              <div className="warningBox">
                <strong>30 minutes:</strong> warning sent — <em>“You have 15 minutes remaining.”</em>
              </div>
              <div className="warningBox">
                <strong>45 minutes:</strong> if the job is not complete, the customer is refunded, the job is relisted, and discipline is applied.
              </div>
            </div>
            <div>
              <div className="eyebrow">For contractors</div>
              <h2>More jobs. Clear expectations.</h2>
              <p className="sub">
                Contractors send quotes — they do not compete in a live bidding system. Once a job is awarded,
                the pickup clock and missed-pickup policy are clear.
              </p>
              <ul className="checkList">
                {contractorPoints.map((point) => <li key={point}>✓ <span>{point}</span></li>)}
              </ul>
              <Link className="btn primary" href="/dashboard">Join as a Contractor →</Link>
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <div className="eyebrow">Missed pickup policy</div>
            <h2>Clear rules. Consistent enforcement.</h2>
            <div className="disciplineGrid">
              {[
                ["01", "First missed pickup", "Written warning"],
                ["02", "Second missed pickup", "48-hour suspension"],
                ["03", "Third missed pickup", "7-day suspension"],
                ["04", "Fourth missed pickup", "Deactivation"],
              ].map(([n, title, action]) => (
                <div className="disciplineCard" key={n}>
                  <span>{n}</span>
                  <strong>{title}</strong>
                  <p>{action}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container finalCta">
            <div className="eyebrow">Ready when you are</div>
            <h2>Pic it. Post it. Get it gone.</h2>
            <p className="sub">Junk Run brings customers and independent contractors together through a simple, quote-based marketplace.</p>
            <div className="actions">
              <Link className="btn primary" href="/jobs">Get Started →</Link>
              <Link className="btn secondary" href="/dashboard">Open Dashboard</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <strong>JunkRunApp.com</strong>
          <p>Independent service providers. Marketplace technology by BSJ Innovation LLC.</p>
          <div className="actions">
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/contractor">Contractor Agreement</Link>
            <Link href="/legal/customer">Customer Agreement</Link>
            <Link href="/legal/prohibited">Prohibited Items</Link>
            <Link href="/legal/refunds">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
