"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { api, getErrorMessage } from "@/lib/api-client";
import type { Device, DeviceDetails } from "@/lib/types";

const schema = z.object({
  hardware_specifications: z.string().optional(),
  vendor_name: z.string().optional(),
  vendor_part_number: z.string().optional(),
  vendor_serial_number: z.string().optional(),
  purchasing_details: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_order_number: z.string().optional(),
  warranty_expiry_date: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
  currency: z.string().optional(),
  price_notes: z.string().optional(),
  notes: z.string().optional(),
  serial_number: z.string().optional(),
  model_number: z.string().optional(),
  firmware_version: z.string().optional(),
  installed_date: z.string().optional(),
  last_maintenance_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DeviceDetailsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const deviceId = params.id as string;

  const { data: device, isLoading } = useQuery({
    queryKey: ["device", deviceId],
    queryFn: () => api.get<Device & { details: DeviceDetails | null }>(`/api/devices/${deviceId}`),
    enabled: !!deviceId,
  });

  const existingDetails = device?.details ?? null;
  const isCreate = !existingDetails;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values:
      existingDetails
        ? {
            hardware_specifications: existingDetails.hardware_specifications ?? "",
            vendor_name: existingDetails.vendor_name ?? "",
            vendor_part_number: existingDetails.vendor_part_number ?? "",
            vendor_serial_number: existingDetails.vendor_serial_number ?? "",
            purchasing_details: existingDetails.purchasing_details ?? "",
            purchase_date: existingDetails.purchase_date ?? "",
            purchase_order_number: existingDetails.purchase_order_number ?? "",
            warranty_expiry_date: existingDetails.warranty_expiry_date ?? "",
            purchase_price: existingDetails.purchase_price ?? undefined,
            currency: existingDetails.currency ?? "",
            price_notes: existingDetails.price_notes ?? "",
            notes: existingDetails.notes ?? "",
            serial_number: existingDetails.serial_number ?? "",
            model_number: existingDetails.model_number ?? "",
            firmware_version: existingDetails.firmware_version ?? "",
            installed_date: existingDetails.installed_date ?? "",
            last_maintenance_date: existingDetails.last_maintenance_date ?? "",
          }
        : {
            hardware_specifications: "",
            vendor_name: "",
            vendor_part_number: "",
            vendor_serial_number: "",
            purchasing_details: "",
            purchase_date: "",
            purchase_order_number: "",
            warranty_expiry_date: "",
            purchase_price: undefined,
            currency: "",
            price_notes: "",
            notes: "",
            serial_number: "",
            model_number: "",
            firmware_version: "",
            installed_date: "",
            last_maintenance_date: "",
          },
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) => {
      const payload: Record<string, unknown> = { ...body };
      if (payload.purchase_price === undefined) delete payload.purchase_price;
      return api.post<DeviceDetails>(`/api/devices/${deviceId}/details`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
      toast.success("Device details created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (body: FormData) => {
      const payload: Record<string, unknown> = { ...body };
      if (payload.purchase_price === undefined) delete payload.purchase_price;
      return api.put<DeviceDetails>(`/api/devices/${deviceId}/details`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
      toast.success("Device details updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!deviceId) return null;
  if (isLoading || !device) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCreate ? "Create device details" : "Edit device details"}
        description={`Device ${device.device_id.slice(0, 8)}… · ${device.device_type} · ${device.city}`}
        action={
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/devices">Back to devices</Link>
          </Button>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>{isCreate ? "Details" : "Update details"}</CardTitle>
          <CardDescription>
            {isCreate
              ? "Add hardware, vendor, and purchase information for this device."
              : "Edit device details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) =>
              isCreate ? createMutation.mutate(data) : updateMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hardware specifications</Label>
                <Input className="rounded-xl" {...form.register("hardware_specifications")} />
              </div>
              <div className="space-y-2">
                <Label>Vendor name</Label>
                <Input className="rounded-xl" {...form.register("vendor_name")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vendor part number</Label>
                <Input className="rounded-xl" {...form.register("vendor_part_number")} />
              </div>
              <div className="space-y-2">
                <Label>Vendor serial number</Label>
                <Input className="rounded-xl" {...form.register("vendor_serial_number")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Purchasing details</Label>
              <Input className="rounded-xl" {...form.register("purchasing_details")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Purchase date</Label>
                <Input type="date" className="rounded-xl" {...form.register("purchase_date")} />
              </div>
              <div className="space-y-2">
                <Label>Purchase order number</Label>
                <Input className="rounded-xl" {...form.register("purchase_order_number")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Warranty expiry date</Label>
                <Input type="date" className="rounded-xl" {...form.register("warranty_expiry_date")} />
              </div>
              <div className="space-y-2">
                <Label>Purchase price</Label>
                <Input type="number" step="any" className="rounded-xl" {...form.register("purchase_price")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input className="rounded-xl" {...form.register("currency")} />
              </div>
              <div className="space-y-2">
                <Label>Price notes</Label>
                <Input className="rounded-xl" {...form.register("price_notes")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input className="rounded-xl" {...form.register("notes")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Serial number</Label>
                <Input className="rounded-xl" {...form.register("serial_number")} />
              </div>
              <div className="space-y-2">
                <Label>Model number</Label>
                <Input className="rounded-xl" {...form.register("model_number")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Firmware version</Label>
                <Input className="rounded-xl" {...form.register("firmware_version")} />
              </div>
              <div className="space-y-2">
                <Label>Installed date</Label>
                <Input type="date" className="rounded-xl" {...form.register("installed_date")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Last maintenance date</Label>
              <Input type="date" className="rounded-xl" {...form.register("last_maintenance_date")} />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="rounded-xl"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isCreate
                  ? createMutation.isPending
                    ? "Creating..."
                    : "Create device details"
                  : updateMutation.isPending
                    ? "Saving..."
                    : "Save changes"}
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/devices">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
