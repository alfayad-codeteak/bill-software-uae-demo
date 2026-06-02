import { NextResponse } from "next/server";
import type { Bill } from "@/lib/types";
import { normalizeIndianPhone } from "@/lib/validation";

function buildYaadroPayload(bill: Bill, shopId: string) {
  const rawPhone = bill.customer.phone || "";
  const customer_phone_number = normalizeIndianPhone(rawPhone) || rawPhone;

  return {
    shop_id: shopId,
    bill_no: bill.invoiceNumber,
    customer_name: (bill.customer.name || "").trim(),
    customer_phone_number,
    address: bill.customer.address || "",
    total_amount: Number(bill.total),
    items: bill.items.map((item) => ({
      item_name: item.name,
      quantity: item.qty,
      price: Number(item.rate),
      totalamount: Number(item.amount),
      vat: Number(item.gstAmount),
    })),
    // Optional/defaults (backend accepts these if provided)
    urgency: "Normal",
    payment_mode: "cash",
  };
}

export async function POST(request: Request) {
  const shopId = process.env.YAADRO_SHOP_ID;
  const apiKey = process.env.YAADRO_ADMIN_API_KEY;
  const pythonBaseUrl = (
    process.env.YAADRO_PYTHON_BASE_URL ||
    process.env.DEFAULT_BASE_URL ||
    "https://shop-api.yaadro.online"
  ).replace(/\/+$/, "");
  const endpointPath = process.env.PYTHON_ENDPOINT_PATH || "/api/orders/create";

  if (!shopId || !apiKey) {
    return NextResponse.json(
      { error: "Yaadro not configured (YAADRO_SHOP_ID / YAADRO_ADMIN_API_KEY)" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Bill & { date?: string };
    const bill: Bill = {
      invoiceNumber: body.invoiceNumber,
      date: body.date ? new Date(body.date) : new Date(),
      customer: body.customer,
      items: body.items,
      subtotal: Number(body.subtotal),
      tax: Number(body.tax),
      total: Number(body.total),
    };

    const payload = buildYaadroPayload(bill, shopId);
    const url = `${pythonBaseUrl}${endpointPath.startsWith("/") ? "" : "/"}${endpointPath}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        // recommended by backend to relax some security checks
        "User-Agent": "python-requests/2.31.0",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Yaadro API error:", res.status, text);
      return NextResponse.json(
        { error: "Yaadro order failed", details: text },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("POST /api/yaadro/order error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 }
    );
  }
}
