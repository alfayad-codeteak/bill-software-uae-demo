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

/** Short URL (bill must be in local DB or embedded in hash). Use when you only have invoiceNumber. */
export function getShareableBillUrl(bill: { invoiceNumber: string }): string {
  return `${BILL_APP_BASE_URL}/?view=${encodeURIComponent(bill.invoiceNumber)}`;
}

/**
 * Share URL with bill data embedded in the hash so it works on any device (e.g. when scanning QR on mobile).
 * Use this for QR codes and copy-link so the recipient can open the bill without cloud sync.
 */
export function getShareableBillUrlWithData(bill: Bill): string {
  const payload = JSON.stringify({
    ...bill,
    date: bill.date instanceof Date ? bill.date.toISOString() : bill.date,
  });
  const base64 = typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(payload)))
    : Buffer.from(payload, 'utf-8').toString('base64');
  const safe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${BILL_APP_BASE_URL}/?view=${encodeURIComponent(bill.invoiceNumber)}#${safe}`;
}

/** Parse bill from current page URL hash (self-contained share link). Call only on client. */
export function parseBillFromShareUrl(): Bill | null {
  if (typeof window === 'undefined' || typeof atob === 'undefined') return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(base64)));
    const raw = JSON.parse(json) as Record<string, unknown>;
    return { ...raw, date: new Date(raw.date as string) } as Bill;
  } catch {
    return null;
  }
}

export function getBillIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || params.get('v');
}
