"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import type { Advertiser } from "@/lib/types";

const schema = z
  .object({
    campaign_code: z.string().min(1, "Code is required").max(255),
    advertiser_id: z.string().uuid("Select an advertiser"),
    campaign_name: z.string().min(1, "Name is required").max(500),
    campaign_description: z.string().max(5000).optional(),
    country: z.string().min(1, "Country is required").max(255),
    city: z.string().min(1, "City is required").max(255),
    postcode: z.string().min(1, "Postcode is required").max(20),
    campaign_start_date: z.string().min(1, "Start date is required"),
    campaign_end_date: z.string().min(1, "End date is required"),
    campaign_expiry_date: z.string().optional(),
    campaign_status: z.enum(["draft", "active", "paused", "inactive", "expired"]),
  })
  .refine(
    (data) => !data.campaign_end_date || !data.campaign_start_date || data.campaign_end_date >= data.campaign_start_date,
    { message: "End date must be on or after start date", path: ["campaign_end_date"] }
  );

type FormData = z.infer<typeof schema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: advertisersData } = useQuery({
    queryKey: ["advertisers"],
    queryFn: () => api.get<{ data: Advertiser[] }>("/api/advertisers"),
  });
  const advertisers = advertisersData?.data ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      campaign_code: "",
      advertiser_id: "",
      campaign_name: "",
      campaign_description: "",
      country: "",
      city: "",
      postcode: "",
      campaign_start_date: "",
      campaign_end_date: "",
      campaign_expiry_date: "",
      campaign_status: "draft",
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) =>
      api.post<{ campaign_id: string }>("/api/campaigns", {
        ...body,
        campaign_description: body.campaign_description || undefined,
        campaign_expiry_date: body.campaign_expiry_date || undefined,
      }),
    onSuccess: () => {
      toast.success("Campaign created");
      router.push("/campaigns");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function onSubmit(data: FormData) {
    createMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Campaign"
        description="Add a new campaign. You can add ads after saving."
        action={
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/campaigns">Cancel</Link>
          </Button>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Campaign details</CardTitle>
          <CardDescription>Fill in the required fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Campaign code</Label>
                <Input className="rounded-xl" {...form.register("campaign_code")} />
                {form.formState.errors.campaign_code && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.campaign_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Advertiser</Label>
                <Select
                  value={form.watch("advertiser_id")}
                  onValueChange={(v) => form.setValue("advertiser_id", v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select advertiser..." />
                  </SelectTrigger>
                  <SelectContent>
                    {advertisers.map((a) => (
                      <SelectItem key={a.advertiser_id} value={a.advertiser_id}>
                        {a.advertiser_name} ({a.advertiser_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.advertiser_id && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.advertiser_id.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Campaign name</Label>
              <Input className="rounded-xl" {...form.register("campaign_name")} />
              {form.formState.errors.campaign_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.campaign_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input className="rounded-xl" {...form.register("campaign_description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input className="rounded-xl" {...form.register("country")} />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input className="rounded-xl" {...form.register("city")} />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input className="rounded-xl" {...form.register("postcode")} />
                {form.formState.errors.postcode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.postcode.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" className="rounded-xl" {...form.register("campaign_start_date")} />
                {form.formState.errors.campaign_start_date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.campaign_start_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" className="rounded-xl" {...form.register("campaign_end_date")} />
                {form.formState.errors.campaign_end_date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.campaign_end_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Expiry date (optional)</Label>
                <Input type="date" className="rounded-xl" {...form.register("campaign_expiry_date")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("campaign_status")}
                onValueChange={(v) => form.setValue("campaign_status", v as FormData["campaign_status"])}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["draft", "active", "paused", "inactive", "expired"] as const).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="rounded-xl shadow-sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl">
                <Link href="/campaigns">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
