"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
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
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api, getErrorMessage } from "@/lib/api-client";
import type { Campaign } from "@/lib/types";

const schema = z.object({
  campaign_code: z.string().min(1).max(255),
  campaign_name: z.string().min(1).max(500),
  campaign_description: z.string().max(5000).optional(),
  country: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  postcode: z.string().min(1).max(20),
  campaign_start_date: z.string().min(1),
  campaign_end_date: z.string().min(1),
  campaign_expiry_date: z.string().optional(),
  campaign_status: z.enum(["draft", "active", "paused", "inactive", "expired"]),
});

type FormData = z.infer<typeof schema>;

export default function CampaignEditPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.get<Campaign>(`/api/campaigns/${id}`),
    enabled: !!id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: campaign
      ? {
          campaign_code: campaign.campaign_code,
          campaign_name: campaign.campaign_name,
          campaign_description: campaign.campaign_description ?? "",
          country: campaign.country,
          city: campaign.city,
          postcode: campaign.postcode,
          campaign_start_date: campaign.campaign_start_date,
          campaign_end_date: campaign.campaign_end_date,
          campaign_expiry_date: campaign.campaign_expiry_date ?? "",
          campaign_status: campaign.campaign_status,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (body: FormData) =>
      api.put<Campaign>(`/api/campaigns/${id}`, {
        ...body,
        campaign_description: body.campaign_description || undefined,
        campaign_expiry_date: body.campaign_expiry_date || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Campaign updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted");
      (window as unknown as { location: { href: string } }).location.href = "/campaigns";
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!id) return null;
  if (isLoading || !campaign) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.campaign_name}
        description={`Edit campaign ${campaign.campaign_code}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/campaigns">Back</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/campaigns/${id}/ads`}>Manage ads</Link>
            </Button>
            <Button variant="destructive" className="rounded-xl" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Campaign details</CardTitle>
          <CardDescription>Update and save.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Campaign code</Label>
                <Input className="rounded-xl" {...form.register("campaign_code")} />
                {form.formState.errors.campaign_code && (
                  <p className="text-sm text-destructive">{form.formState.errors.campaign_code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Campaign name</Label>
                <Input className="rounded-xl" {...form.register("campaign_name")} />
                {form.formState.errors.campaign_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.campaign_name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
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
                  <p className="text-sm text-destructive">{form.formState.errors.postcode.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" className="rounded-xl" {...form.register("campaign_start_date")} />
                {form.formState.errors.campaign_start_date && (
                  <p className="text-sm text-destructive">{form.formState.errors.campaign_start_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" className="rounded-xl" {...form.register("campaign_end_date")} />
                {form.formState.errors.campaign_end_date && (
                  <p className="text-sm text-destructive">{form.formState.errors.campaign_end_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Expiry date</Label>
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
            <Button type="submit" className="rounded-xl" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete campaign"
        description="Are you sure you want to delete this campaign? All ads under it will be removed. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => deleteMutation.mutate()}
      />
    </div>
  );
}
