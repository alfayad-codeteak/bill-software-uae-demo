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
    default: "Easy Billing India | Invoice & Bill Software",
    template: "%s | Easy Billing India",
  },
  description:
    "Create and manage invoices and bills in India. Save bills, share via link or QR, send orders, and download PDF.",
  keywords: ["billing", "invoice", "India", "bill software", "Yaadro", "PDF", "QR", "INR"],
  authors: [{ name: "Easy Billing India" }],
  creator: "Easy Billing India",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "Easy Billing India",
    title: "Easy Billing India | Invoice & Bill Software",
    description: "Create and manage invoices and bills in India. Save bills, share via link or QR, send orders, and download PDF.",
    images: [
      {
        url: "/easybilling.jpg",
        width: 1200,
        height: 630,
        alt: "Easy Billing India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easy Billing India | Invoice & Bill Software",
    description: "Create and manage invoices and bills in India. Save bills, share via link or QR, send orders, and download PDF.",
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
