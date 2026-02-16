"use client";

import { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useInvoiceStore((state) => state.addItem);

    const handleAdd = () => {
        addItem(product);
        toast.success(product.name, {
            description: `Added to invoice at ${formatCurrency(product.price)}`,
            duration: 2000,
        });
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
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 shrink-0">
                        {product.gstRate}% VAT
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-grow flex flex-col justify-end">
                <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                <div className="text-lg font-bold text-primary">
                    {formatCurrency(product.price)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                        / {product.unit}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-0 pb-3 mt-auto">
                <Button onClick={handleAdd} className="w-full h-8 text-xs" size="sm">
                    <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
            </CardFooter>
        </Card>
    );
}
