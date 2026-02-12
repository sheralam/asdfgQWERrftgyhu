import { NextRequest } from "next/server";
import {
  advertisers,
  uuid,
  now,
} from "@/lib/mock-data";
import type { AdvertiserCreate, AdvertiserListResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const includeDeleted = searchParams.get("include_deleted") === "true";

  const list = Array.from(advertisers.values()).filter(
    (a) => includeDeleted || !a.deleted_at
  );
  const total = list.length;
  const data = list.slice(offset, offset + limit);

  const body: AdvertiserListResponse = { data, meta: { total_count: total, limit, offset } };
  return Response.json(body);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AdvertiserCreate;
  const existing = Array.from(advertisers.values()).find(
    (a) => a.advertiser_code === body.advertiser_code
  );
  if (existing) {
    return Response.json(
      { error: { code: "CONFLICT", message: "advertiser_code already exists" } },
      { status: 409 }
    );
  }
  const id = uuid();
  const advertiser = {
    advertiser_id: id,
    ...body,
    address_line_2: body.address_line_2 ?? null,
    location: body.location ?? null,
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    updated_by_id: null,
    deleted_at: null,
  };
  advertisers.set(id, advertiser);
  return Response.json(advertiser, { status: 201 });
}
