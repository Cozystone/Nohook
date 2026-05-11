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
  title: "Nohook | Vietnam Street Risk Map",
  description:
    "Street-level tourist risk mapping for aggressive touting, fake taxi pressure, and overcharge hotspots in Vietnam.",
  keywords: [
    "Vietnam travel safety",
    "tourist scam map",
    "street risk map",
    "Ho Chi Minh City",
    "Hanoi Old Quarter",
  ],
  openGraph: {
    title: "Nohook | Vietnam Street Risk Map",
    description:
      "Preview a deployable MVP for road-level tourist safety signals in Vietnam.",
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
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
