import { NextRequest } from "next/server";
import { hosts, deviceGroups } from "@/lib/mock-data";
import type { DeviceGroupUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const { id: hostId, groupId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const g = deviceGroups.get(groupId);
  if (!g || g.host_id !== hostId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device group not found" } },
      { status: 404 }
    );
  }
  return Response.json(g);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const { id: hostId, groupId } = await params;
  const g = deviceGroups.get(groupId);
  if (!g || g.host_id !== hostId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device group not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as DeviceGroupUpdate;
  const updated = { ...g, ...body, updated_at: new Date().toISOString() };
  deviceGroups.set(groupId, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const { id: hostId, groupId } = await params;
  const g = deviceGroups.get(groupId);
  if (!g || g.host_id !== hostId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device group not found" } },
      { status: 404 }
    );
  }
  deviceGroups.set(groupId, { ...g, status: "deleted" as const, updated_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
