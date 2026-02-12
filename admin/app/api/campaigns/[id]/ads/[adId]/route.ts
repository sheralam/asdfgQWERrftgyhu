import { NextRequest } from "next/server";
import {
  campaigns,
  ads,
  adContents,
  adTimeSlots,
  adContentRatings,
  uuid,
  now,
} from "@/lib/mock-data";
import type { AdUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; adId: string }> }
) {
  const { id: campaignId, adId } = await params;
  if (!campaigns.get(campaignId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Campaign not found" } },
      { status: 404 }
    );
  }
  const a = ads.get(adId);
  if (!a || a.campaign_id !== campaignId || a.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Ad not found" } },
      { status: 404 }
    );
  }
  const content = adContents.get(adId);
  const slots = Array.from(adTimeSlots.values()).filter((s) => s.ad_id === adId);
  const ratings = adContentRatings.get(adId);
  return Response.json({
    ...a,
    content: content ?? null,
    time_slots: slots,
    content_ratings: ratings ?? null,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; adId: string }> }
) {
  const { id: campaignId, adId } = await params;
  const a = ads.get(adId);
  if (!a || a.campaign_id !== campaignId || a.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Ad not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as AdUpdate;
  const { content: contentUpdate, time_slots: _t, content_ratings: _r, ...rest } = body;
  const updated = { ...a, ...rest, updated_at: new Date().toISOString() };
  ads.set(adId, updated);
  if (contentUpdate) {
    const existing = adContents.get(adId);
    const contentRecord = {
      content_id: existing?.content_id ?? uuid(),
      ad_id: adId,
      media_type: contentUpdate.media_type,
      media_content: contentUpdate.media_content,
      ad_impression_duration: contentUpdate.ad_impression_duration,
      alloted_max_impression_count: contentUpdate.alloted_max_impression_count ?? existing?.alloted_max_impression_count ?? null,
      ad_advertiser_forwarding_url: contentUpdate.ad_advertiser_forwarding_url ?? existing?.ad_advertiser_forwarding_url ?? null,
      created_at: existing?.created_at ?? now(),
      updated_at: now(),
    };
    adContents.set(adId, contentRecord);
  }
  const content = adContents.get(adId);
  const slots = Array.from(adTimeSlots.values()).filter((s) => s.ad_id === adId);
  const ratings = adContentRatings.get(adId);
  return Response.json({
    ...updated,
    content: content ?? null,
    time_slots: slots,
    content_ratings: ratings ?? null,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; adId: string }> }
) {
  const { id: campaignId, adId } = await params;
  const a = ads.get(adId);
  if (!a || a.campaign_id !== campaignId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Ad not found" } },
      { status: 404 }
    );
  }
  ads.set(adId, { ...a, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
