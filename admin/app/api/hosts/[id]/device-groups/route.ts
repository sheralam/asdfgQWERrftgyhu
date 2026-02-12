import { NextRequest } from "next/server";
import { hosts, deviceGroups, uuid, now } from "@/lib/mock-data";
import type { DeviceGroupCreate, DeviceGroupListResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const status = request.nextUrl.searchParams.get("status");
  let list = Array.from(deviceGroups.values()).filter((g) => g.host_id === hostId);
  if (status) list = list.filter((g) => g.status === status);
  const data = list.slice(offset, offset + limit);
  const body: DeviceGroupListResponse = {
    data,
    meta: { total_count: list.length, limit, offset },
  };
  return Response.json(body);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as DeviceGroupCreate;
  const existing = Array.from(deviceGroups.values()).find(
    (g) => g.host_id === hostId && g.group_name === body.group_name
  );
  if (existing) {
    return Response.json(
      { error: { code: "CONFLICT", message: "group_name already exists for this host" } },
      { status: 409 }
    );
  }
  const id = uuid();
  const group = {
    id,
    host_id: hostId,
    group_name: body.group_name,
    status: body.status ?? "active",
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    updated_by_id: null,
  };
  deviceGroups.set(id, group);
  return Response.json(group, { status: 201 });
}
