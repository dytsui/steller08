import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { LocaleProvider } from "@/components/layout/use-locale";

export const metadata: Metadata = {
  title: "Steller08",
  description: "AI golf coaching platform for users and pros"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <LocaleProvider>
          <Header />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
