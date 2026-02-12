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
import type { Host } from "@/lib/types";

export default function HostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["hosts"],
    queryFn: () => api.get<{ data: Host[]; meta: { total_count: number } }>("/api/hosts"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/hosts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosts"] });
      toast.success("Host deleted");
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const hosts = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hosts"
        description="Create and manage hosts. Add contacts, bank accounts, and device groups from the edit page."
        action={
          <Button asChild className="rounded-xl shadow-sm">
            <Link href="/hosts/new">Create Host</Link>
          </Button>
        }
      />

      {error && (
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : hosts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hosts yet. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Age group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hosts.map((h) => (
                <TableRow key={h.host_id}>
                  <TableCell className="font-medium">{h.host_name}</TableCell>
                  <TableCell>{h.city}</TableCell>
                  <TableCell>{h.country}</TableCell>
                  <TableCell>{h.target_audience_age_group ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-2"
                      onClick={() => router.push(`/hosts/${h.host_id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-2"
                      onClick={() => router.push(`/hosts/${h.host_id}/device-groups`)}
                    >
                      Device groups
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setDeleteId(h.host_id)}
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
        title="Delete host"
        description="Are you sure you want to delete this host? Contacts, bank accounts, and device groups will be removed. This action cannot be undone."
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
