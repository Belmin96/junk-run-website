import Link from "next/link";

const jobs = [
  ["JR-1042","Furniture","Phoenix, AZ","Couch, chairs and miscellaneous household items.","Sep 20"],
  ["JR-1041","Yard Waste","Glendale, AZ","Bagged branches and green waste.","Sep 20"],
  ["JR-1039","Appliances","Peoria, AZ","Appliance removal and general household junk.","Sep 21"],
  ["JR-1037","Household Junk","Surprise, AZ","Boxes, shelving and mixed household items.","Sep 22"],
  ["JR-1034","Construction Debris","Goodyear, AZ","Non-hazardous renovation debris.","Sep 22"],
  ["JR-1031","Commercial","Phoenix, AZ","Small commercial cleanout.","Sep 23"]
];

export default function JobsPage(){
 return <main className="container"><header className="nav"><Link href="/" className="brand"><span className="brandMark">JR</span>JUNK RUN</Link><nav className="navlinks"><Link href="/">Home</Link><Link href="/dashboard">Dashboard</Link></nav></header><section className="section"><div className="eyebrow">Public marketplace</div><h1 style={{fontSize:48}}>Available loads</h1><p className="sub">Public information only. No names, exact addresses, GPS coordinates or estimates are shown here.</p><div className="search"><input placeholder="Search jobs or descriptions..."/><select defaultValue="all"><option value="all">All categories</option><option>Furniture</option><option>Yard Waste</option><option>Appliances</option><option>Household Junk</option><option>Construction Debris</option><option>Commercial</option></select></div><div className="jobs">{jobs.map(([id,cat,city,desc,date])=><article className="job" key={id}><span className="pill">{cat}</span><h3>{id}</h3><p>📍 {city}</p><p>📅 {date}</p><p>{desc}</p><div className="private">Estimates and exact location are private.</div><div className="actions"><Link className="btn primary" href="/dashboard">Sign in to estimate</Link></div></article>)}</div></section></main>
}