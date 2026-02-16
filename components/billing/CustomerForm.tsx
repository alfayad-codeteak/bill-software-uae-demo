"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { X } from "lucide-react";

/** UAE mobile: exactly 9 digits, starting with 5 (e.g. 501234567). Used for Yaadro. */
export const UAE_PHONE_REGEX = /^5\d{8}$/;
export function normalizeUaePhone(value: string): string {
    const digits = (value || "").replace(/\D/g, "");
    return digits;
}
export function isValidUaePhone(value: string): boolean {
    if (!value || typeof value !== "string") return false;
    const digits = normalizeUaePhone(value);
    return digits.length === 9 && UAE_PHONE_REGEX.test(digits);
}

const customerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    phone: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (val) => !val || isValidUaePhone(val),
            { message: "Must be 9-digit UAE mobile starting with 5 (e.g. 501234567)" }
        ),
    address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerForm() {
    const { customer, setCustomer } = useInvoiceStore();

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer,
        mode: "onBlur"
    });

    const phoneValue = form.watch("phone");

    // Sync form with store on change
    useEffect(() => {
        const subscription = form.watch((value) => {
            setCustomer(value as Partial<CustomerFormValues>);
        });
        return () => subscription.unsubscribe();
    }, [form.watch, setCustomer]);

    // Live validation for phone (Yaadro): re-validate when phone changes
    useEffect(() => {
        if (phoneValue !== undefined && phoneValue !== "") {
            form.trigger("phone");
        }
    }, [phoneValue]);

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                    id="name"
                    placeholder="Business or Person Name"
                    {...form.register("name")}
                    className={form.formState.errors.name ? "border-red-500" : ""}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone (required for Yaadro)</Label>
                <Input
                    id="phone"
                    placeholder="501234567 (UAE 9 digits)"
                    {...form.register("phone")}
                    className={form.formState.errors.phone ? "border-red-500" : ""}
                />
                {form.formState.errors.phone ? (
                    <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
                ) : (
                    <p className="text-xs text-muted-foreground">UAE mobile: 9 digits starting with 5</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="billing@company.com" {...form.register("email")} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="address">Billing Address</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => {
                            form.setValue("address", "");
                            setCustomer({ address: "" });
                        }}
                    >
                        <X className="w-3 h-3 mr-1" /> Clear
                    </Button>
                </div>
                <Input
                    id="address"
                    placeholder="Street, City, State, Zip"
                    {...form.register("address")}
                    className={form.formState.errors.address ? "border-red-500" : ""}
                />
                {form.formState.errors.address && (
                    <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
                )}
            </div>
        </div>
    );
}
