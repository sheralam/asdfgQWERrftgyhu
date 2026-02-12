"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api, getErrorMessage } from "@/lib/api-client";
import type { Campaign, Ad } from "@/lib/types";

export default function CampaignAdsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params.id as string;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => api.get<Campaign>(`/api/campaigns/${campaignId}`),
    enabled: !!campaignId,
  });

  const { data: adsData, isLoading: adsLoading } = useQuery({
    queryKey: ["campaign-ads", campaignId],
    queryFn: () =>
      api.get<{ data: Ad[] }>(`/api/campaigns/${campaignId}/ads`),
    enabled: !!campaignId,
  });

  const deleteMutation = useMutation({
    mutationFn: (adId: string) =>
      api.delete(`/api/campaigns/${campaignId}/ads/${adId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-ads", campaignId] });
      toast.success("Ad deleted");
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const ads = adsData?.data ?? [];
  const isLoading = campaignLoading || adsLoading;

  if (!campaignId) return null;
  if (campaignLoading || !campaign) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ads: ${campaign.campaign_name}`}
        description={`Manage ads for campaign ${campaign.campaign_code}.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={`/campaigns/${campaignId}`}>Back to campaign</Link>
            </Button>
            <Button
              className="rounded-xl shadow-sm"
              onClick={() => router.push(`/campaigns/${campaignId}/ads/new`)}
            >
              Add ad
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {ads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No ads yet. Add one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((a) => (
                <TableRow key={a.ad_id}>
                  <TableCell className="font-medium">{a.ad_code}</TableCell>
                  <TableCell>{a.ad_name}</TableCell>
                  <TableCell>{a.ad_position}</TableCell>
                  <TableCell>{a.ad_type}</TableCell>
                  <TableCell>{a.ad_status}</TableCell>
                  <TableCell>
                    {a.ad_start_date} – {a.ad_end_date}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="rounded-xl">
                        <Link href={`/campaigns/${campaignId}/ads/${a.ad_id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setDeleteId(a.ad_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete ad"
        description="Are you sure you want to delete this ad? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteId) await deleteMutation.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
