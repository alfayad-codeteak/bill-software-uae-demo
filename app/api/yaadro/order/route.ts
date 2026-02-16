import { NextResponse } from "next/server";
import type { Bill } from "@/lib/types";

const YAADRO_BASE = "https://api.yaadro.ae/api/orders/create/public";

function buildYaadroPayload(bill: Bill) {
  return {
    customer_name: bill.customer.name || "Walk-in Customer",
    customer_phone_number: bill.customer.phone || "",
    address: bill.customer.address || "",
    total_amount: Number(bill.total),
    bill_no: bill.invoiceNumber,
    urgency: "Normal",
    payment_mode: "cash",
    special_instructions: "",
    vat: Number(bill.tax),
    tip: 0,
    delivery_charge: 0,
    water: false,
    water_count: 0,
    items: bill.items.map((item) => ({
      item_name: item.name,
      quantity: item.qty,
      price: Number(item.rate),
      totalamount: Number(item.amount),
      vat: Number(item.gstAmount),
    })),
  };
}

export async function POST(request: Request) {
  const shopId = process.env.YAADRO_SHOP_ID;
  const token = process.env.YAADRO_INTEGRATION_TOKEN;

  if (!shopId || !token) {
    return NextResponse.json(
      { error: "Yaadro not configured (YAADRO_SHOP_ID / YAADRO_INTEGRATION_TOKEN)" },
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

    const payload = buildYaadroPayload(bill);
    const url = `${YAADRO_BASE}/${encodeURIComponent(shopId)}:${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
