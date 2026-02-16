"use client";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function InvoiceSummary() {
    const { getSubtotal, getTotalTax, getGrandTotal, items } = useInvoiceStore();

    const subtotal = getSubtotal();
    const tax = getTotalTax();
    const total = getGrandTotal();

    if (items.length === 0) return null;

    return (
        <Card className="bg-muted/30">
            <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total VAT</span>
                    <span>{formatCurrency(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-end">
                    <span className="font-semibold text-lg">Grand Total</span>
                    <span className="font-bold text-xl text-primary">{formatCurrency(total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
