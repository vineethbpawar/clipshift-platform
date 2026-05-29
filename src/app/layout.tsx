import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipShift | Premium Cinematic Creator Platform",
  description: "The ultimate platform for cinematic creators to showcase and collaborate on professional visual projects.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClipShift",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ChatProvider } from "@/context/ChatContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground flex flex-col`}>
        <AuthProvider>
          <ChatProvider>
            <Toaster position="bottom-right" toastOptions={{
              className: 'glass text-white border border-white/10',
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
              },
            }} />
            <Navbar />
            <main className="flex-1 flex flex-col pb-24 md:pb-0">
              {children}
            </main>
            <MobileNav />
            <Footer />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
