"use client";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { ReceiptPreview } from "./ReceiptPreview";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { getShareableBillUrl } from "@/lib/utils";

export function SharedBillPage() {
    const { customer, items, invoiceNumber, date, getSubtotal, getTotalTax, getGrandTotal } = useInvoiceStore();
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [barcodeUrl, setBarcodeUrl] = useState<string>("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!invoiceNumber) return;

        const shareUrl = getShareableBillUrl({ invoiceNumber });
        if (!shareUrl) return;
        import("qrcode").then((QRCode) => {
            QRCode.toDataURL(shareUrl, { width: 100, margin: 1 }, (err, url) => {
                if (!err) setQrCodeUrl(url);
            });
        });
        import("jsbarcode").then((JsBarcode) => {
            const canvas = document.createElement("canvas");
            JsBarcode.default(canvas, invoiceNumber, {
                format: "CODE128",
                displayValue: true,
                width: 2,
                height: 40,
                fontSize: 14,
                margin: 0,
            });
            setBarcodeUrl(canvas.toDataURL("image/png"));
        });
    }, [invoiceNumber]);

    if (!isClient) return null;

    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-muted/20 py-6">
            <ReceiptPreview />
            <div className="mt-6">
                <PDFDownloadLink
                    document={
                        <InvoicePDF
                            customer={customer}
                            items={items}
                            invoiceId={invoiceNumber}
                            date={date}
                            qrCodeUrl={qrCodeUrl}
                            barcodeUrl={barcodeUrl}
                        />
                    }
                    fileName={`Invoice-${invoiceNumber}.pdf`}
                >
                    {({ loading }) => (
                        <Button disabled={loading || items.length === 0} size="lg">
                            <Download className="w-4 h-4 mr-2" />
                            {loading ? "Generating PDF…" : "Download PDF"}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
}
