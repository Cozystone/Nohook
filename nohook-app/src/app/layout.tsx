import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nohook | 베트남 거리 위험 지도",
  description:
    "베트남 관광지에서 호객행위, 가짜 택시, 과다요금 위험 도로를 실제 지도 위에서 확인하는 서비스.",
  keywords: [
    "베트남 여행 안전",
    "관광객 사기 지도",
    "거리 위험 지도",
    "호치민 1군",
    "하노이 올드쿼터",
  ],
  openGraph: {
    title: "Nohook | 베트남 거리 위험 지도",
    description:
      "베트남 핵심 관광지의 위험 도로 신호를 실제 지도 위에 표시하는 Nohook MVP.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
