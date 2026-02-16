"use client";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { InvoiceItem } from "@/lib/types";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function InvoiceTable() {
    const { items, updateQty, removeItem } = useInvoiceStore();

    const columns: ColumnDef<InvoiceItem>[] = [
        {
            accessorKey: "name",
            header: "Item Description",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            accessorKey: "rate",
            header: "Rate",
            cell: ({ row }) => (
                <div className="text-right">{formatCurrency(row.original.rate)}</div>
            ),
        },
        {
            accessorKey: "qty",
            header: "Qty",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 w-[100px]">
                    <Input
                        type="number"
                        min="1"
                        className="h-8 w-16 text-center px-1"
                        value={row.original.qty}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateQty(row.original.id, isNaN(val) ? 0 : val);
                        }}
                    />
                    <span className="text-xs text-muted-foreground">{row.original.unit}</span>
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="text-right font-semibold">
                    {formatCurrency(row.original.amount)}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={() => removeItem(row.original.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (items.length === 0) {
        return (
            <Card className="border-dashed mb-6 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <p>No items added yet</p>
                    <p className="text-sm">Select products from the catalog to build invoice</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="rounded-md border bg-card overflow-hidden">
            <Table className="min-w-[500px]">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className={header.column.columnDef.header === "Amount" || header.column.columnDef.header === "Rate" || header.id === "actions" ? "text-right" : ""}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="p-2 sm:p-3">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
