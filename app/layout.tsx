import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JunkRunApp.com | Curb it. We'll serve it.",
  description: "Junk Run connects customers with independent haulers through a mobile-first junk removal marketplace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}