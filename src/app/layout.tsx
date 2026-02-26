import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placement automation - NavGurukul Placement Portal",
  description:
    "Placement automation is NavGurukul's placement portal to discover opportunities, track applications, and manage placements for learners and alumni.",
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
          <Toaster position="top-right" />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
