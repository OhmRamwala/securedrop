import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureDrop | Secure File Sharing",
  description: "Secure, client-side encrypted file sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0e17] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
