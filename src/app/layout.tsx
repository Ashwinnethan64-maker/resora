import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ResoraProvider } from "@/context/ResoraContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

function getMetadataBase(): URL {
  const customUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (customUrl) {
    try {
      return new URL(customUrl.startsWith('http') ? customUrl : `https://${customUrl}`);
    } catch {}
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }
  return new URL('https://resora-eight.vercel.app');
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "RESORA — Personal Research Intelligence",
    template: "%s — RESORA",
  },
  description:
    "Save it. Understand it. Use it. Personal research intelligence for developers, researchers, and builders.",
  applicationName: "RESORA",
  icons: {
    icon: [
      { url: "/Resora_logo.ico" },
      { url: "/Resora_logo.png", type: "image/png" },
    ],
    shortcut: "/Resora_logo.ico",
    apple: [
      { url: "/Resora_logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "RESORA — Personal Research Intelligence",
    description: "Save it. Understand it. Use it. Turn scattered research into compound knowledge.",
    siteName: "RESORA",
    images: [
      {
        url: "/Resora_logo.png",
        width: 1254,
        height: 1254,
        alt: "RESORA Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RESORA — Personal Research Intelligence",
    description: "Save it. Understand it. Use it. Personal research intelligence for developers, researchers, and builders.",
    images: ["/Resora_logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FFFDF5] text-[#000000] selection:bg-[#FFD93D] selection:text-[#000000]">
        <OfflineBanner />
        <ResoraProvider>
          {children}
        </ResoraProvider>
      </body>
    </html>
  );
}
