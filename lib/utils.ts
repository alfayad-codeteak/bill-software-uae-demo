import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bill } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 2,
  }).format(amount);
}

// Production base URL so QR codes and share links always point to the live app
const BILL_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://billsoftwareuae.vercel.app';

export function getShareableBillUrl(bill: { invoiceNumber: string }): string {
  return `${BILL_APP_BASE_URL}/?view=${encodeURIComponent(bill.invoiceNumber)}`;
}

export function getBillIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || params.get('v');
}
