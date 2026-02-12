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
import type { AdCreate, AdListResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  if (!campaigns.get(campaignId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Campaign not found" } },
      { status: 404 }
    );
  }
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const list = Array.from(ads.values()).filter(
    (a) => a.campaign_id === campaignId && !a.deleted_at
  );
  const data = list.map((a) => {
    const content = adContents.get(a.ad_id);
    const slots = Array.from(adTimeSlots.values()).filter((s) => s.ad_id === a.ad_id);
    const ratings = adContentRatings.get(a.ad_id);
    return { ...a, content: content ?? null, time_slots: slots, content_ratings: ratings ?? null };
  }).slice(offset, offset + limit);
  const body: AdListResponse = {
    data,
    meta: { total_count: list.length, limit, offset },
  };
  return Response.json(body);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  if (!campaigns.get(campaignId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Campaign not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as AdCreate;
  const existing = Array.from(ads.values()).find((a) => a.ad_code === body.ad_code);
  if (existing) {
    return Response.json(
      { error: { code: "CONFLICT", message: "ad_code already exists" } },
      { status: 409 }
    );
  }
  const adId = uuid();
  const ad = {
    ad_id: adId,
    ad_code: body.ad_code,
    campaign_id: campaignId,
    ad_name: body.ad_name,
    ad_description: body.ad_description ?? null,
    country: null,
    city: null,
    postcode: null,
    ad_position: body.ad_position,
    ad_type: body.ad_type,
    ad_start_date: body.ad_start_date,
    ad_end_date: body.ad_end_date,
    ad_expiry_date: null,
    ad_in_view_duration: null,
    ad_view_count: 0,
    ad_status: body.ad_status ?? "draft",
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    created_by_name: null,
    updated_by_id: null,
    updated_by_name: null,
    deleted_at: null,
  };
  ads.set(adId, ad);
  if (body.content) {
    const contentId = uuid();
    adContents.set(adId, {
      content_id: contentId,
      ad_id: adId,
      media_type: body.content.media_type,
      media_content: body.content.media_content,
      ad_impression_duration: body.content.ad_impression_duration,
      alloted_max_impression_count: body.content.alloted_max_impression_count ?? null,
      ad_advertiser_forwarding_url: body.content.ad_advertiser_forwarding_url ?? null,
      created_at: now(),
      updated_at: null,
    });
  }
  if (body.time_slots?.length) {
    for (const slot of body.time_slots) {
      const slotId = uuid();
      adTimeSlots.set(slotId, {
        time_slot_id: slotId,
        ad_id: adId,
        time_slot_start: slot.time_slot_start,
        time_slot_end: slot.time_slot_end,
        created_at: now(),
      });
    }
  }
  if (body.content_ratings) {
    const ratingId = uuid();
    adContentRatings.set(adId, {
      rating_id: ratingId,
      ad_id: adId,
      mpaa_rating: body.content_ratings.mpaa_rating ?? null,
      esrb_rating: body.content_ratings.esrb_rating ?? null,
      warning_required: body.content_ratings.warning_required ?? true,
      content_warnings: body.content_ratings.content_warnings ?? [],
      no_prohibited_content: body.content_ratings.no_prohibited_content ?? false,
      created_at: now(),
      updated_at: null,
    });
  }
  const full = ads.get(adId)!;
  const content = adContents.get(adId);
  const slots = Array.from(adTimeSlots.values()).filter((s) => s.ad_id === adId);
  const ratings = adContentRatings.get(adId);
  return Response.json(
    { ...full, content: content ?? null, time_slots: slots, content_ratings: ratings ?? null },
    { status: 201 }
  );
}
