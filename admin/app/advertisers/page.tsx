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
import type { Advertiser } from "@/lib/types";

export default function AdvertisersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["advertisers"],
    queryFn: () => api.get<{ data: Advertiser[]; meta: { total_count: number } }>("/api/advertisers"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/advertisers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisers"] });
      toast.success("Advertiser deleted");
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const advertisers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advertisers"
        description="Create and manage advertisers. Add contacts and bank accounts from the edit page."
        action={
          <Button asChild className="rounded-xl shadow-sm">
            <Link href="/advertisers/new">Create Advertiser</Link>
          </Button>
        }
      />

      {error && (
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : advertisers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No advertisers yet. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisers.map((a) => (
                <TableRow key={a.advertiser_id}>
                  <TableCell className="font-medium">{a.advertiser_code}</TableCell>
                  <TableCell>{a.advertiser_name}</TableCell>
                  <TableCell>{a.advertiser_type}</TableCell>
                  <TableCell>{a.city}</TableCell>
                  <TableCell>{a.country}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-2"
                      onClick={() => router.push(`/advertisers/${a.advertiser_id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setDeleteId(a.advertiser_id)}
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
        title="Delete advertiser"
        description="Are you sure you want to delete this advertiser? Contacts and bank accounts will be removed as well. This action cannot be undone."
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
