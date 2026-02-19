import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PlaceHub - Your Dream Job, Just a Click Away",
  description: "Connect with top companies, track your applications in real-time, and land your perfect job with AI-powered matching.",
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${outfit.variable} antialiased bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 min-h-screen`}
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
