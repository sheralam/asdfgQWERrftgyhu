"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
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
import { api } from "@/lib/api-client";
import type { DeviceListResponse } from "@/lib/types";

export default function DevicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get<DeviceListResponse>("/api/devices"),
  });

  const devices = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        description="List of devices. Open details to create or edit device details."
      />

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No devices found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Host ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Display</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((d) => (
                <TableRow key={d.device_id}>
                  <TableCell className="font-mono text-sm">{d.device_id.slice(0, 8)}…</TableCell>
                  <TableCell className="font-mono text-sm">{d.host_id.slice(0, 8)}…</TableCell>
                  <TableCell>{d.device_type}</TableCell>
                  <TableCell>{d.device_rating}</TableCell>
                  <TableCell>{d.display_size}</TableCell>
                  <TableCell>{d.city}</TableCell>
                  <TableCell>{d.country}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild className="rounded-xl">
                      <Link href={`/devices/${d.device_id}/details`}>Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
