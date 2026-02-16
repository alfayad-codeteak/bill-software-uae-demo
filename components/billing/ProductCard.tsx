"use client";

import { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useInvoiceStore((state) => state.addItem);
    const updateQty = useInvoiceStore((state) => state.updateQty);
    const removeItem = useInvoiceStore((state) => state.removeItem);
    const items = useInvoiceStore((state) => state.items);

    const lineItem = items.find((i) => i.productId === product.id);
    const isInBill = !!lineItem;

    const handleAdd = () => {
        addItem(product);
        toast.success(product.name, {
            description: `Added to invoice at ${formatCurrency(product.price)}`,
            duration: 2000,
        });
    };

    const handleQtyChange = (delta: number) => {
        if (!lineItem) return;
        const newQty = lineItem.qty + delta;
        if (newQty <= 0) {
            removeItem(lineItem.id);
            return;
        }
        updateQty(lineItem.id, newQty);
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
            {product.image && (
                <div className="relative w-full h-32 overflow-hidden bg-muted/20">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}
            <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-grow flex flex-col justify-end">
                <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                <div className="text-lg font-bold text-black">
                    {formatCurrency(product.price)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                        / {product.unit}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-0 pb-3 mt-auto">
                {isInBill ? (
                    <div className="w-full flex items-center justify-between gap-1 rounded-md border bg-muted/30 p-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleQtyChange(-1)}
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-sm font-semibold tabular-nums min-w-[1.5rem] text-center">
                            {lineItem.qty}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleQtyChange(1)}
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleAdd} className="w-full h-8 text-xs" size="sm">
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
