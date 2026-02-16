"use client";

import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { Customer, InvoiceItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

// Register generic font if needed, or use standard fonts
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
        fontSize: 10,
        fontFamily: "Helvetica",
    },
    header: {
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1a1a1a",
    },
    companyInfo: {
        fontSize: 10,
        color: "#666",
        marginBottom: 20,
    },
    customerSection: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: "#f9fafb",
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        borderBottomStyle: "solid",
        alignItems: "center",
        height: 24,
    },
    headerRow: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        color: "#374151",
    },
    cell: {
        paddingLeft: 5,
        paddingRight: 5,
    },
    col1: { width: "5%" }, // #
    col2: { width: "40%" }, // Item
    col3: { width: "10%", textAlign: "right" }, // Rate
    col4: { width: "10%", textAlign: "center" }, // Qty
    col5: { width: "10%", textAlign: "right" }, // GST %
    col6: { width: "10%", textAlign: "right" }, // GST Amt
    col7: { width: "15%", textAlign: "right" }, // Total

    totalSection: {
        marginTop: 20,
        alignItems: "flex-end",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 5,
    },
    totalLabel: {
        width: 100,
        textAlign: "right",
        paddingRight: 10,
        color: "#666",
    },
    totalValue: {
        width: 100,
        textAlign: "right",
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    grandTotal: {
        fontSize: 14,
        borderTopWidth: 1,
        borderTopColor: "#000",
        paddingTop: 5,
        marginTop: 5,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 8,
        color: "#999",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 10,
        alignItems: "center", // Center barcode
    },
    barcode: {
        width: 150,
        height: 40,
        marginBottom: 5,
    },
    qrCode: {
        width: 60,
        height: 60,
    }
});

interface InvoicePDFProps {
    customer: Customer;
    items: InvoiceItem[];
    invoiceId: string;
    date: Date;
    qrCodeUrl?: string;
    barcodeUrl?: string;
}

export const InvoicePDF = ({ customer, items, invoiceId, date, qrCodeUrl, barcodeUrl }: InvoicePDFProps) => {
    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const totalTax = items.reduce((acc, item) => acc + item.gstAmount, 0);
    const grandTotal = subtotal + totalTax;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text style={{ color: '#666' }}>#{invoiceId}</Text>
                        <Text style={{ color: '#666' }}>{format(new Date(date), "MMM dd, yyyy")}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Your Company Name</Text>
                        <Text style={{ color: '#666' }}>123 Business Park, Tech City</Text>
                        <Text style={{ color: '#666' }}>Bangalore, India - 560001</Text>
                        <Text style={{ color: '#666' }}>GSTIN: 29ABCDE1234F1Z5</Text>
                        {qrCodeUrl && (
                            <Image src={qrCodeUrl} style={{ width: 50, height: 50, marginTop: 10 }} />
                        )}
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.customerSection}>
                    <Text style={styles.sectionTitle}>Bill To:</Text>
                    <Text>{customer.name}</Text>
                    {customer.address && <Text>{customer.address}</Text>}
                    {customer.phone && <Text>Phone: {customer.phone}</Text>}
                    {customer.email && <Text>Email: {customer.email}</Text>}
                    {customer.gstin && <Text>TRN: {customer.gstin}</Text>}
                </View>

                {/* Table Header */}
                <View style={[styles.row, styles.headerRow]}>
                    <Text style={[styles.cell, styles.col1]}>#</Text>
                    <Text style={[styles.cell, styles.col2]}>Item Description</Text>
                    <Text style={[styles.cell, styles.col3]}>Rate</Text>
                    <Text style={[styles.cell, styles.col4]}>Qty</Text>
                    <Text style={[styles.cell, styles.col5]}>VAT %</Text>
                    <Text style={[styles.cell, styles.col6]}>VAT</Text>
                    <Text style={[styles.cell, styles.col7]}>Amount</Text>
                </View>

                {/* Table Rows */}
                {items.map((item, index) => (
                    <View key={item.id} style={styles.row}>
                        <Text style={[styles.cell, styles.col1]}>{index + 1}</Text>
                        <Text style={[styles.cell, styles.col2]}>{item.name}</Text>
                        <Text style={[styles.cell, styles.col3]}>{item.rate.toFixed(2)}</Text>
                        <Text style={[styles.cell, styles.col4]}>{item.qty} {item.unit}</Text>
                        <Text style={[styles.cell, styles.col5]}>{item.gstRate}%</Text>
                        <Text style={[styles.cell, styles.col6]}>{item.gstAmount.toFixed(2)}</Text>
                        <Text style={[styles.cell, styles.col7]}>{(item.amount + item.gstAmount).toFixed(2)}</Text>
                    </View>
                ))}

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalValue}>{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total VAT:</Text>
                        <Text style={styles.totalValue}>{totalTax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text style={[styles.totalLabel, { color: 'black', fontWeight: 'bold' }]}>Grand Total:</Text>
                        <Text style={styles.totalValue}>AED {grandTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ position: "absolute", bottom: 30, left: 30, right: 30, alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10, alignItems: 'flex-end' }}>
                        {/* Barcode Left */}
                        <View>
                            {barcodeUrl && (
                                <Image src={barcodeUrl} style={{ width: 150, height: 30 }} />
                            )}
                        </View>

                        {/* QR Right */}
                        <View style={{ alignItems: 'center' }}>
                            {qrCodeUrl && (
                                <Image src={qrCodeUrl} style={{ width: 60, height: 60 }} />
                            )}
                            <Text style={{ fontSize: 6, color: "#999", marginTop: 2 }}>Scan to view digital copy</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 8, color: "#999" }}>Thank you for your business!</Text>
                    <Text style={{ fontSize: 8, color: "#999" }}>Terms & Conditions apply. This is a computer generated invoice.</Text>
                </View>
            </Page>
        </Document>
    );
};
