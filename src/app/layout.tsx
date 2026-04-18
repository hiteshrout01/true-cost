import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import MouseFollower from "@/components/MouseFollower";
import CursorGlow from "@/components/CursorGlow";
import DashboardFAB from "@/components/DashboardFAB";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINSIGHT | Financial Transparency Dashboard",
  description: "Advanced financial analysis and insights.",
};

import { ReportProvider } from "@/context/ReportContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-transparent text-on-background min-h-screen flex flex-col antialiased relative">
        <ReportProvider>
          <AnimatedBackground />
          <CursorGlow />
          <MouseFollower />
          <Navbar />
          {children}
          <DashboardFAB />
        </ReportProvider>
      </body>
    </html>
  );
}
