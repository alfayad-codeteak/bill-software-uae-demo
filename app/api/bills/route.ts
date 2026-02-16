import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Bill } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  try {
    const bill = (await request.json()) as Bill;
    const { invoiceNumber, date, customer, items, subtotal, tax, total } = bill;

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: "invoiceNumber required" },
        { status: 400 }
      );
    }

    const row = {
      invoice_number: invoiceNumber,
      date: typeof date === "string" ? date : new Date(date).toISOString(),
      customer,
      items,
      subtotal: Number(subtotal),
      tax: Number(tax),
      total: Number(total),
    };

    const { error } = await supabase
      .from("bills")
      .upsert(row, { onConflict: "invoice_number" });

    if (error) {
      console.error("Supabase bills upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: invoiceNumber });
  } catch (e) {
    console.error("POST /api/bills error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 }
    );
  }
}
