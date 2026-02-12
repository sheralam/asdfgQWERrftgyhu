"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api, getErrorMessage } from "@/lib/api-client";
import type { Host, DeviceGroup, DeviceGroupStatus } from "@/lib/types";

const STATUSES: DeviceGroupStatus[] = ["active", "paused", "deleted"];

export default function HostDeviceGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hostId = params.id as string;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [status, setStatus] = useState<DeviceGroupStatus>("active");

  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ["host", hostId],
    queryFn: () => api.get<Host>(`/api/hosts/${hostId}`),
    enabled: !!hostId,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["host-device-groups", hostId],
    queryFn: () =>
      api.get<{ data: DeviceGroup[] }>(`/api/hosts/${hostId}/device-groups`),
    enabled: !!hostId,
  });

  const createMutation = useMutation({
    mutationFn: (body: { group_name: string; status?: DeviceGroupStatus }) =>
      api.post<DeviceGroup>(`/api/hosts/${hostId}/device-groups`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-device-groups", hostId] });
      toast.success("Device group created");
      setAddOpen(false);
      setGroupName("");
      setStatus("active");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) =>
      api.delete(`/api/hosts/${hostId}/device-groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-device-groups", hostId] });
      toast.success("Device group deleted");
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const groups = groupsData?.data ?? [];
  const isLoading = hostLoading || groupsLoading;

  if (!hostId) return null;
  if (hostLoading || !host) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Device groups: ${host.host_name}`}
        description="Manage device groups for this host."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={`/hosts/${hostId}`}>Back to host</Link>
            </Button>
            <Button className="rounded-xl shadow-sm" onClick={() => setAddOpen(true)}>
              Add device group
            </Button>
          </div>
        }
      />

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Device groups</CardTitle>
          <CardDescription>Groups can be assigned to devices. Add or remove groups here.</CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No device groups yet. Add one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.group_name}</TableCell>
                    <TableCell>{g.status}</TableCell>
                    <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setDeleteId(g.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Add device group</DialogTitle>
            <DialogDescription>Create a new device group for this host.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Group name</Label>
              <Input
                className="rounded-xl"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Downtown fleet"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DeviceGroupStatus)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={!groupName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate({ group_name: groupName.trim(), status })}
            >
              {createMutation.isPending ? "Adding..." : "Add device group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete device group"
        description="Are you sure you want to delete this device group? This action cannot be undone."
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
