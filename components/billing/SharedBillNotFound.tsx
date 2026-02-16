"use client";

import { Button } from "@/components/ui/button";
import { FileQuestion, PlusCircle, LayoutTemplate } from "lucide-react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useRouter } from "next/navigation";

export function SharedBillNotFound() {
    const { setViewMode, resetInvoice } = useInvoiceStore();
    const router = useRouter();

    const handleCreateNew = () => {
        setViewMode(false);
        resetInvoice();
        router.replace("/");
    };

    const handleLoadDemo = () => {
        setViewMode(false);
        resetInvoice();
        router.replace("/");
        // In a real app, this might load sample data
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6 text-center space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shrink-0">
                <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>

            <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Bill Not Found on Device</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                    This bill was created on another device. Since this is an offline-first demo,
                    data is stored locally on the creator's device and doesn't sync to the cloud yet.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <Button onClick={handleCreateNew} className="flex-1">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Bill
                </Button>
                <Button variant="outline" onClick={handleLoadDemo} className="flex-1">
                    <LayoutTemplate className="w-4 h-4 mr-2" />
                    View Sample
                </Button>
            </div>
        </div>
    );
}
