import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
export const metadata:Metadata={title:"JunkRunApp.com | Curb it. We'll serve it.",description:"Junk Run connects customers with independent haulers through a mobile-first junk removal marketplace."};
export default function RootLayout({children}:{children:React.ReactNode}){return <ClerkProvider><html lang="en"><body>{children}</body></html></ClerkProvider>}