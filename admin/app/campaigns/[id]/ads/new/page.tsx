"use client";

import { useParams, useRouter } from "next/navigation";
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
import type { AdPosition, AdType } from "@/lib/types";

const schema = z.object({
  ad_code: z.string().min(1, "Code is required").max(255),
  ad_name: z.string().min(1, "Name is required").max(500),
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
  ad_start_date: z.string().min(1, "Start date is required"),
  ad_end_date: z.string().min(1, "End date is required"),
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

export default function NewAdPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ad_code: "",
      ad_name: "",
      ad_description: "",
      ad_position: "top_bar_ad",
      ad_type: "image_only_ad",
      ad_start_date: "",
      ad_end_date: "",
      ad_status: "draft",
      media_type: "image",
      media_content: "",
      impression_value: 15,
      impression_unit: "seconds",
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: FormData) => {
      const payload: Record<string, unknown> = {
        ad_code: body.ad_code,
        campaign_id: campaignId,
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
      return api.post(`/api/campaigns/${campaignId}/ads`, payload);
    },
    onSuccess: () => {
      toast.success("Ad created");
      router.push(`/campaigns/${campaignId}/ads`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function onSubmit(data: FormData) {
    createMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Ad"
        description="Add a new ad to this campaign."
        action={
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/campaigns/${campaignId}/ads`}>Cancel</Link>
          </Button>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Ad details</CardTitle>
          <CardDescription>Fill in the required fields. Optionally add content.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Label>Description (optional)</Label>
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
                <Label>Media content (e.g. URL or text)</Label>
                <Input className="rounded-xl" {...form.register("media_content")} placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="rounded-xl shadow-sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Ad"}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl">
                <Link href={`/campaigns/${campaignId}/ads`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
