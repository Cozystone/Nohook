import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nohook | 베트남 거리 위험 지도",
  description:
    "베트남 관광지에서 호객행위, 택시 바가지, 시클로 과다요금 위험 도로를 지도 위에서 먼저 확인하는 서비스",
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
      "베트남 주요 관광지의 위험 도로 신호를 지도 위에서 먼저 확인하는 Nohook MVP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
