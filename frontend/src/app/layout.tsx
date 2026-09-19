import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#8B0014",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SAPC IntellySys — Multi-Factor Student Failure Decision Support System",
  description: "Web-based Decision Support System for San Antonio de Padua College addressing academic and non-academic failure causes with AHP decision modeling and RA 10173 data privacy compliance.",
  applicationName: "SAPC IntellySys",
  manifest: "/manifest.json",
  icons: {
    icon: "/sapc-icon.svg",
    apple: "/sapc-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SAPC IntellySys",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#8B0014" />
        <meta name="apple-mobile-web-app-title" content="SAPC IntellySys" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900 font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
