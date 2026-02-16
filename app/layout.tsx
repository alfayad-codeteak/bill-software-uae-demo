import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://billsoftwareuae.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Easy Billing UAE | Invoice & Bill Software",
    template: "%s | Easy Billing UAE",
  },
  description:
    "Create and manage invoices and bills in the UAE. Save bills, share via link or QR, send to Yaadro, and download PDF.",
  keywords: ["billing", "invoice", "UAE", "bill software", "Yaadro", "PDF", "QR"],
  authors: [{ name: "Easy Billing UAE" }],
  creator: "Easy Billing UAE",
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: baseUrl,
    siteName: "Easy Billing UAE",
    title: "Easy Billing UAE | Invoice & Bill Software",
    description: "Create and manage invoices and bills in the UAE. Save bills, share via link or QR, send to Yaadro, and download PDF.",
    images: [
      {
        url: "/easybilling.jpg",
        width: 1200,
        height: 630,
        alt: "Easy Billing UAE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easy Billing UAE | Invoice & Bill Software",
    description: "Create and manage invoices and bills in the UAE. Save bills, share via link or QR, send to Yaadro, and download PDF.",
    images: ["/easybilling.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
        <Toaster richColors position="top-center" expand closeButton />
      </body>
    </html>
  );
}
