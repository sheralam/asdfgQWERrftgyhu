"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { api, getErrorMessage } from "@/lib/api-client";
import type { AgeGroup } from "@/lib/types";

const schema = z.object({
  host_name: z.string().min(1, "Name is required").max(500),
  target_audience_age_group: z
    .enum(["0-5", "6-12", "13-18", "19-35", "36-55", "55+"])
    .optional()
    .nullable(),
  address_line_1: z.string().min(1, "Address is required").max(500),
  address_line_2: z.string().max(500).optional(),
  city: z.string().min(1, "City is required").max(255),
  state_province: z.string().min(1, "State/Province is required").max(255),
  postal_code: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(255),
  timezone: z.string().min(1, "Timezone is required").max(100),
});

type FormData = z.infer<typeof schema>;

const AGE_GROUPS: AgeGroup[] = ["0-5", "6-12", "13-18", "19-35", "36-55", "55+"];

export default function NewHostPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      host_name: "",
      target_audience_age_group: null,
      address_line_1: "",
      address_line_2: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "",
      timezone: "America/New_York",
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) =>
      api.post<{ host_id: string }>("/api/hosts", {
        ...body,
        target_audience_age_group: body.target_audience_age_group ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Host created");
      router.push("/hosts");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function onSubmit(data: FormData) {
    createMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Host"
        description="Add a new host. You can add contacts, bank accounts, and device groups after saving."
        action={
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/hosts">Cancel</Link>
          </Button>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Host details</CardTitle>
          <CardDescription>Fill in the required fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="host_name">Host name</Label>
              <Input id="host_name" className="rounded-xl" {...form.register("host_name")} />
              {form.formState.errors.host_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.host_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Target audience age group (optional)</Label>
              <Select
                value={form.watch("target_audience_age_group") ?? ""}
                onValueChange={(v) =>
                  form.setValue("target_audience_age_group", v ? (v as AgeGroup) : null)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {AGE_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line_1">Address line 1</Label>
              <Input id="address_line_1" className="rounded-xl" {...form.register("address_line_1")} />
              {form.formState.errors.address_line_1 && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address_line_1.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line_2">Address line 2 (optional)</Label>
              <Input id="address_line_2" className="rounded-xl" {...form.register("address_line_2")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" className="rounded-xl" {...form.register("city")} />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state_province">State / Province</Label>
                <Input
                  id="state_province"
                  className="rounded-xl"
                  {...form.register("state_province")}
                />
                {form.formState.errors.state_province && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.state_province.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal code</Label>
                <Input id="postal_code" className="rounded-xl" {...form.register("postal_code")} />
                {form.formState.errors.postal_code && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.postal_code.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" className="rounded-xl" {...form.register("country")} />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" className="rounded-xl" {...form.register("timezone")} />
                {form.formState.errors.timezone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.timezone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="rounded-xl shadow-sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Host"}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl">
                <Link href="/hosts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
