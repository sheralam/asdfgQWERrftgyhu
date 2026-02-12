"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { Campaign } from "@/lib/types";

export default function CampaignsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () =>
      api.get<{ data: Campaign[]; meta: { total_count: number } }>("/api/campaigns"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted");
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const campaigns = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create and manage campaigns. Add ads from the campaign edit page."
        action={
          <Button asChild className="rounded-xl shadow-sm">
            <Link href="/campaigns/new">Create Campaign</Link>
          </Button>
        }
      />

      {error && (
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No campaigns yet. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Advertiser ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.campaign_id}>
                  <TableCell className="font-medium">{c.campaign_code}</TableCell>
                  <TableCell>{c.campaign_name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.advertiser_id.slice(0, 8)}…</TableCell>
                  <TableCell>{c.campaign_status}</TableCell>
                  <TableCell>
                    {c.campaign_start_date} – {c.campaign_end_date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-2"
                      onClick={() => router.push(`/campaigns/${c.campaign_id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-2"
                      onClick={() => router.push(`/campaigns/${c.campaign_id}/ads`)}
                    >
                      Ads
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setDeleteId(c.campaign_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {meta && meta.total_count > 0 && (
          <div className="border-t border-border px-4 py-2 text-sm text-muted-foreground">
            Total: {meta.total_count}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete campaign"
        description="Are you sure you want to delete this campaign? All ads under it will be removed. This action cannot be undone."
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
