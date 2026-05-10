import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipShift | Premium Cinematic Creator Marketplace",
  description: "The ultimate platform for cinematic creators to showcase and trade premium assets.",
};

import { ChatProvider } from "@/context/ChatContext";

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
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
