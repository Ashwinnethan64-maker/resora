import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ResoraProvider } from "@/context/ResoraContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F0F0F0] text-[#121212] selection:bg-[#F0C020] selection:text-[#121212]">
        <OfflineBanner />
        <ResoraProvider>
          {children}
        </ResoraProvider>
      </body>
    </html>
  );
}
