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

export function getShareableBillUrl(bill: { invoiceNumber: string }): string {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/?view=${encodeURIComponent(bill.invoiceNumber)}`;
}

export function getBillIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || params.get('v');
}
