import { NextRequest } from "next/server";
import { campaigns, uuid, now } from "@/lib/mock-data";
import type { CampaignCreate, CampaignListResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const includeDeleted = searchParams.get("include_deleted") === "true";

  const list = Array.from(campaigns.values()).filter(
    (c) => includeDeleted || !c.deleted_at
  );
  const total = list.length;
  const data = list.slice(offset, offset + limit);

  const body: CampaignListResponse = { data, meta: { total_count: total, limit, offset } };
  return Response.json(body);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CampaignCreate;
  const existing = Array.from(campaigns.values()).find(
    (c) => c.campaign_code === body.campaign_code
  );
  if (existing) {
    return Response.json(
      { error: { code: "CONFLICT", message: "campaign_code already exists" } },
      { status: 409 }
    );
  }
  const id = uuid();
  const campaign = {
    campaign_id: id,
    ...body,
    campaign_description: body.campaign_description ?? null,
    campaign_expiry_date: body.campaign_expiry_date ?? null,
    campaign_max_view_duration: body.campaign_max_view_duration ?? null,
    campaign_max_view_count: body.campaign_max_view_count ?? null,
    campaign_status: body.campaign_status ?? "draft",
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    created_by_name: null,
    updated_by_id: null,
    updated_by_name: null,
    deleted_at: null,
  };
  campaigns.set(id, campaign);
  return Response.json(campaign, { status: 201 });
}
