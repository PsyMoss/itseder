import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ITSeder — IT solutions · Israel",
  description: "פתרונות IT למשרדים, תמיכה מרחוק, שרתים ותשתיות",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-[#0A0908] text-[#DDD5C8]">
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}