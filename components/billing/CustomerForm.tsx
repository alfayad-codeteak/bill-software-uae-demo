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

import { isValidIndianMobile } from "@/lib/validation";

const customerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    phone: z
        .string()
        .min(1, "Phone is required")
        .refine(
            (val) => isValidIndianMobile(val),
            { message: "Enter a valid Indian mobile (10 digits, starts 6–9; accepts +91/0 prefix)" }
        ),
    address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerForm() {
    const { customer, setCustomer, customerErrors, clearCustomerErrors } = useInvoiceStore();

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer,
        mode: "onBlur"
    });

    const phoneValue = form.watch("phone");

    // When store customer is updated externally (e.g. Edit saved bill), reset form to show loaded details
    useEffect(() => {
        const current = form.getValues();
        const fromStore = {
            name: customer.name ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            address: customer.address ?? "",
        };
        if (
            current.name !== fromStore.name ||
            current.email !== fromStore.email ||
            current.phone !== fromStore.phone ||
            current.address !== fromStore.address
        ) {
            form.reset(fromStore);
        }
    }, [customer.name, customer.email, customer.phone, customer.address]);

    // Sync form with store on change
    useEffect(() => {
        const subscription = form.watch((value) => {
            // make errors feel "live" as soon as user types anywhere
            clearCustomerErrors();
            setCustomer(value as Partial<CustomerFormValues>);
        });
        return () => subscription.unsubscribe();
    }, [form.watch, setCustomer]);

    // Live validation for phone: re-validate when phone changes
    useEffect(() => {
        if (phoneValue !== undefined && phoneValue !== "") {
            form.trigger("phone");
        }
    }, [phoneValue]);

    // If global customerErrors were set (e.g. Print Bill validation), reflect them into RHF UI
    useEffect(() => {
        if (!customerErrors) return;
        const map: Partial<Record<keyof CustomerFormValues, string>> = {
            name: customerErrors.name,
            phone: customerErrors.phone,
            email: customerErrors.email,
            address: customerErrors.address,
        };
        (Object.keys(map) as (keyof CustomerFormValues)[]).forEach((key) => {
            const msg = map[key];
            if (msg) form.setError(key, { type: "manual", message: msg });
        });
    }, [customerErrors]);

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                    id="name"
                    placeholder="Business or Person Name"
                    {...form.register("name", { onChange: () => clearCustomerErrors() })}
                    className={form.formState.errors.name ? "border-red-500" : ""}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                    id="phone"
                    placeholder="10-digit mobile (accepts +91 or leading 0)"
                    {...form.register("phone", { onChange: () => clearCustomerErrors() })}
                    className={form.formState.errors.phone ? "border-red-500" : ""}
                />
                {form.formState.errors.phone && (
                    <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
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
                    {...form.register("address", { onChange: () => clearCustomerErrors() })}
                    className={form.formState.errors.address ? "border-red-500" : ""}
                />
                {form.formState.errors.address && (
                    <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
                )}
            </div>
        </div>
    );
}
