"use client";

import { useParams, useRouter } from "next/navigation";
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
import type { Ad, AdPosition, AdType } from "@/lib/types";

const schema = z.object({
  ad_code: z.string().min(1).max(255),
  ad_name: z.string().min(1).max(500),
  ad_description: z.string().max(5000).optional(),
  ad_position: z.enum([
    "top_bar_ad",
    "bottom_left_ad",
    "bottom_right_ad",
    "bottom_center_ad",
    "center_right_content_ad",
    "center_left_content_ad",
  ]),
  ad_type: z.enum(["image_only_ad", "multimedia_ad"]),
  ad_start_date: z.string().min(1),
  ad_end_date: z.string().min(1),
  ad_status: z.enum(["draft", "active", "paused", "inactive", "expired"]),
  media_type: z.enum(["text", "image", "gif", "video", "html", "news_rss", "events", "breaking_news", "alerts"]).optional(),
  media_content: z.string().optional(),
  impression_value: z.coerce.number().min(0).optional(),
  impression_unit: z.enum(["seconds", "minutes", "hours", "days"]).optional(),
});

type FormData = z.infer<typeof schema>;

const AD_POSITIONS: AdPosition[] = [
  "top_bar_ad",
  "bottom_left_ad",
  "bottom_right_ad",
  "bottom_center_ad",
  "center_right_content_ad",
  "center_left_content_ad",
];
const AD_TYPES: AdType[] = ["image_only_ad", "multimedia_ad"];
const MEDIA_TYPES = ["text", "image", "gif", "video", "html", "news_rss", "events", "breaking_news", "alerts"];

export default function EditAdPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params.id as string;
  const adId = params.adId as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", campaignId, adId],
    queryFn: () => api.get<Ad>(`/api/campaigns/${campaignId}/ads/${adId}`),
    enabled: !!campaignId && !!adId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: ad
      ? {
          ad_code: ad.ad_code,
          ad_name: ad.ad_name,
          ad_description: ad.ad_description ?? "",
          ad_position: ad.ad_position,
          ad_type: ad.ad_type,
          ad_start_date: ad.ad_start_date,
          ad_end_date: ad.ad_end_date,
          ad_status: ad.ad_status,
          media_type: ad.content?.media_type ?? "image",
          media_content: ad.content?.media_content ?? "",
          impression_value: ad.content?.ad_impression_duration?.value ?? 15,
          impression_unit:
            (ad.content?.ad_impression_duration?.unit as FormData["impression_unit"]) ?? "seconds",
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (body: FormData) => {
      const payload: Record<string, unknown> = {
        ad_code: body.ad_code,
        ad_name: body.ad_name,
        ad_description: body.ad_description || undefined,
        ad_position: body.ad_position,
        ad_type: body.ad_type,
        ad_start_date: body.ad_start_date,
        ad_end_date: body.ad_end_date,
        ad_status: body.ad_status,
      };
      if (body.media_type && body.media_content !== undefined) {
        payload.content = {
          media_type: body.media_type,
          media_content: body.media_content || "",
          ad_impression_duration: {
            value: body.impression_value ?? 15,
            unit: body.impression_unit ?? "seconds",
          },
        };
      }
      return api.put(`/api/campaigns/${campaignId}/ads/${adId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad", campaignId, adId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-ads", campaignId] });
      toast.success("Ad updated");
      router.push(`/campaigns/${campaignId}/ads`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/campaigns/${campaignId}/ads/${adId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-ads", campaignId] });
      toast.success("Ad deleted");
      router.push(`/campaigns/${campaignId}/ads`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!campaignId || !adId) return null;
  if (isLoading || !ad) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${ad.ad_name}`}
        description={`Ad ${ad.ad_code}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={`/campaigns/${campaignId}/ads`}>Back to ads</Link>
            </Button>
            <Button variant="destructive" className="rounded-xl" onClick={() => setDeleteOpen(true)}>
              Delete ad
            </Button>
          </div>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Ad details</CardTitle>
          <CardDescription>Update and save.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ad code</Label>
                <Input className="rounded-xl" {...form.register("ad_code")} />
                {form.formState.errors.ad_code && (
                  <p className="text-sm text-destructive">{form.formState.errors.ad_code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ad name</Label>
                <Input className="rounded-xl" {...form.register("ad_name")} />
                {form.formState.errors.ad_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.ad_name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input className="rounded-xl" {...form.register("ad_description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={form.watch("ad_position")}
                  onValueChange={(v) => form.setValue("ad_position", v as AdPosition)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.watch("ad_type")}
                  onValueChange={(v) => form.setValue("ad_type", v as AdType)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" className="rounded-xl" {...form.register("ad_start_date")} />
                {form.formState.errors.ad_start_date && (
                  <p className="text-sm text-destructive">{form.formState.errors.ad_start_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" className="rounded-xl" {...form.register("ad_end_date")} />
                {form.formState.errors.ad_end_date && (
                  <p className="text-sm text-destructive">{form.formState.errors.ad_end_date.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("ad_status")}
                onValueChange={(v) => form.setValue("ad_status", v as FormData["ad_status"])}
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
            <div className="border-t pt-4 space-y-2">
              <Label className="text-muted-foreground">Content (optional)</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Media type</Label>
                  <Select
                    value={form.watch("media_type") ?? "image"}
                    onValueChange={(v) => form.setValue("media_type", v as FormData["media_type"])}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIA_TYPES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impression duration (value)</Label>
                  <Input type="number" className="rounded-xl" {...form.register("impression_value")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Media content</Label>
                <Input className="rounded-xl" {...form.register("media_content")} placeholder="Optional" />
              </div>
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
        title="Delete ad"
        description="Are you sure you want to delete this ad? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => deleteMutation.mutate()}
      />
    </div>
  );
}
