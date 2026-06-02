import type { Customer } from "@/lib/types";
import type { CustomerErrors } from "@/store/useInvoiceStore";

export function normalizeIndianPhone(value: string): string {
  const digits = (value || "").replace(/\D/g, "");
  // Accept +91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX → normalize to 10 digits
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidIndianMobile(value: string): boolean {
  const digits = normalizeIndianPhone(value);
  return /^\d{10}$/.test(digits) && /^[6-9]/.test(digits);
}

export function validateCustomerForPrint(customer: Customer): { valid: boolean; errors: CustomerErrors } {
  const errors: CustomerErrors = {};

  const name = (customer.name || "").trim();
  if (name.length < 2) errors.name = "Name must be at least 2 characters";

  const phone = (customer.phone || "").trim();
  if (!phone) errors.phone = "Phone is required";
  else if (!isValidIndianMobile(phone)) errors.phone = "Enter a valid Indian mobile (10 digits, starts 6–9)";

  return { valid: Object.keys(errors).length === 0, errors };
}

