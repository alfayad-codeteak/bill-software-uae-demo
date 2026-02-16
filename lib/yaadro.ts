import type { Bill } from "./types";
import type { Customer } from "./types";

/** UAE mobile: exactly 9 digits, starting with 5 (e.g. 501234567). Required by Yaadro. */
const UAE_PHONE_REGEX = /^5\d{8}$/;
function normalizeUaePhone(value: string): string {
  return (value || "").replace(/\D/g, "");
}
export function isValidUaePhone(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const digits = normalizeUaePhone(value);
  return digits.length === 9 && UAE_PHONE_REGEX.test(digits);
}

/** Validate customer for Yaadro (e.g. UAE phone). Call before sending. */
export function validateYaadroCustomer(customer: Customer): { valid: boolean; error?: string } {
  const phone = (customer.phone || "").trim();
  if (!phone) {
    return { valid: false, error: "Customer phone is required for Yaadro" };
  }
  const digits = normalizeUaePhone(phone);
  if (digits.length !== 9) {
    return { valid: false, error: "Customer phone must be a valid 9-digit UAE mobile number starting with 5" };
  }
  if (!UAE_PHONE_REGEX.test(digits)) {
    return { valid: false, error: "Customer phone must start with 5 (UAE mobile)" };
  }
  return { valid: true };
}

/** Send order to Yaadro when user prints/downloads bill. Call from client when PDF download is triggered. */
export async function sendOrderToYaadro(bill: Bill): Promise<{ ok: boolean; error?: string }> {
  const validation = validateYaadroCustomer(bill.customer);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }
  try {
    const res = await fetch("/api/yaadro/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bill,
        date: bill.date instanceof Date ? bill.date.toISOString() : bill.date,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: (data as { error?: string }).error || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}
