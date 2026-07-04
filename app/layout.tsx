import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getThemeInitScript } from "@/lib/rental/user-settings";
import "./globals.css";
import "./lumo-lab.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Lumo Lab — Түрээсийн систем",
  description: "Бараа материал · үнэ тооцоолол · түрээсийн гэрээ",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
