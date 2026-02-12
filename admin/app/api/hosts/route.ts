import { NextRequest } from "next/server";
import { hosts, uuid, now } from "@/lib/mock-data";
import type { HostCreate, HostListResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const includeDeleted = searchParams.get("include_deleted") === "true";

  const list = Array.from(hosts.values()).filter(
    (h) => includeDeleted || !h.deleted_at
  );
  const total = list.length;
  const data = list.slice(offset, offset + limit);

  const body: HostListResponse = { data, meta: { total_count: total, limit, offset } };
  return Response.json(body);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HostCreate;
  const id = uuid();
  const host = {
    host_id: id,
    ...body,
    address_line_2: body.address_line_2 ?? null,
    target_audience_age_group: body.target_audience_age_group ?? null,
    location: body.location ?? null,
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    updated_by_id: null,
    deleted_at: null,
  };
  hosts.set(id, host);
  return Response.json(host, { status: 201 });
}
