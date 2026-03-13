import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { LocaleProvider } from "@/components/layout/use-locale";

export const metadata: Metadata = {
  title: "Steller08",
  description: "Cloudflare + D1/R2 + Render golf AI coaching operating edition"
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
