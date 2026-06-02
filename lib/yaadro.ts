import type { Bill } from "./types";

/** Send order to Yaadro when user prints/downloads bill. Call from client when PDF download is triggered. */
export async function sendOrderToYaadro(bill: Bill): Promise<{ ok: boolean; error?: string }> {
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
      const msg =
        (data as { error?: string; details?: string }).error ||
        (data as { message?: string }).message ||
        res.statusText;
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}
