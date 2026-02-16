import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Bill, InvoiceItem } from "@/lib/types";

function normalizeItems(items: unknown): InvoiceItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((row: Record<string, unknown>) => ({
    id: String(row?.id ?? ""),
    productId: String(row?.productId ?? ""),
    name: String(row?.name ?? ""),
    qty: Number(row?.qty) || 0,
    unit: String(row?.unit ?? ""),
    rate: Number(row?.rate) || 0,
    gstRate: Number(row?.gstRate) ?? 0,
    amount: Number(row?.amount) || 0,
    gstAmount: Number(row?.gstAmount) || 0,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    if (!decodedId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("invoice_number", decodedId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      console.error("Supabase bills get error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rawItems = data.items ?? [];
    const bill: Bill = {
      invoiceNumber: data.invoice_number,
      date: new Date(data.date),
      customer: data.customer ?? { name: "", email: "", phone: "", address: "" },
      items: normalizeItems(rawItems),
      subtotal: Number(data.subtotal),
      tax: Number(data.tax),
      total: Number(data.total),
    };

    return NextResponse.json(bill);
  } catch (e) {
    console.error("GET /api/bills/[id] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bad request" },
      { status: 400 }
    );
  }
}
