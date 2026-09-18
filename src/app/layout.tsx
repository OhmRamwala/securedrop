import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureDrop | Simple, Secure File Transfer",
  description: "Send and receive files up to 2 GB with client-side browser encryption.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#faf9f6] text-stone-900 selection:bg-blue-600 selection:text-white antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
