import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SAPC IntellySys — Multi-Factor Student Failure Decision Support System",
  description: "Web-based Decision Support System for San Antonio de Padua College addressing academic and non-academic failure causes with AHP decision modeling and RA 10173 data privacy compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900 font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

