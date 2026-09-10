import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureDrop | End-to-End Encrypted File Sharing",
  description:
    "Secure file sharing system using client-side AES-256-GCM encryption and direct AWS S3 multipart upload. Zero-knowledge architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
