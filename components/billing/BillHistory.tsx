"use client";

import { useBillsStore } from "@/store/useBillsStore";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Trash2, Eye, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getShareableBillUrl } from "@/lib/utils";

export function BillHistory() {
    const { bills, loadBills, deleteBill } = useBillsStore();

    useEffect(() => {
        loadBills();
    }, [loadBills]); // Add loadBills to dependency array

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    }

    if (bills.length === 0) {
        return (
            <div className="text-center py-12 px-4 text-muted-foreground text-sm">
                <p>No saved bills yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 pb-2">
            {bills.map((bill) => (
                <div
                    key={bill.invoiceNumber}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                >
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base text-foreground truncate">
                                    {bill.customer.name || "Unknown Customer"}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5">#{bill.invoiceNumber}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-semibold text-primary text-base">{formatCurrency(bill.total)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {format(new Date(bill.date), "dd MMM yyyy")}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{bill.items.length} item{bill.items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" title="Share Bill">
                                    <QrCode className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Share Bill</DialogTitle>
                                    <DialogDescription>
                                        Anyone with this link can view this bill on any device (e.g. scan QR on mobile).
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                                        <QRCodeCanvas value={getShareableBillUrl({ invoiceNumber: bill.invoiceNumber })} size={200} level="H" />
                                    </div>
                                    <div className="flex w-full items-center space-x-2">
                                        <div className="grid flex-1 gap-2">
                                            <Label htmlFor="link" className="sr-only">
                                                Link
                                            </Label>
                                            <Input
                                                id="link"
                                                defaultValue={getShareableBillUrl({ invoiceNumber: bill.invoiceNumber })}
                                                readOnly
                                                className="h-9"
                                            />
                                        </div>
                                        <Button type="submit" size="sm" className="px-3" onClick={() => handleCopyLink(getShareableBillUrl({ invoiceNumber: bill.invoiceNumber }))}>
                                            <span className="sr-only">Copy</span>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBill(bill.invoiceNumber)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            title="Delete bill"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
