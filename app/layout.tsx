import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { PWARegister } from "@/components/pwa-register";
import { PWAMeta } from "@/components/pwa-meta";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Joon Drive",
    template: "%s | Joon Drive",
  },
  description:
    "안전하고 편리한 클라우드 스토리지 서비스. 파일 업로드, 다운로드, 관리 및 공유를 한 곳에서.",
  keywords: [
    "클라우드 스토리지",
    "파일 저장소",
    "클라우드 드라이브",
    "파일 관리",
    "Joon Drive",
  ],
  authors: [{ name: "Joon Drive" }],
  creator: "Joon Drive",
  publisher: "Joon Drive",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "Joon Drive - 클라우드 스토리지 서비스",
    description:
      "안전하고 편리한 클라우드 스토리지 서비스. 파일 업로드, 다운로드, 관리 및 공유를 한 곳에서.",
    siteName: "Joon Drive",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joon Drive - 클라우드 스토리지 서비스",
    description:
      "안전하고 편리한 클라우드 스토리지 서비스. 파일 업로드, 다운로드, 관리 및 공유를 한 곳에서.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",

  // 🔥 iOS PWA 상단바 색 여기가 가장 중요
  themeColor: "#ffffff",

  appleWebApp: {
    capable: true,
    title: "Joon Drive",
    statusBarStyle: "default", // 가장 안정적인 iOS 흰색 배경 + 검정 아이콘
  },

  // 🔥 theme-color 및 status-bar-style 제거
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Joon Drive"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <PWAMeta />
        <PWARegister />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
