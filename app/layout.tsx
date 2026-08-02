import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { SITE } from "@/constants/site";
import { Analytics } from "@/components/analytics";
import { PwaRegister } from "@/components/pwa-register";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Zuriè | Luxury Women's Handbags",
    template: "%s | Zuriè",
  },
  description: SITE.description,
  applicationName: "Zurie",
  appleWebApp: {
    capable: true,
    title: "Zurie",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-196.png", sizes: "196x196", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/favicon-196.png",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#171512",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
