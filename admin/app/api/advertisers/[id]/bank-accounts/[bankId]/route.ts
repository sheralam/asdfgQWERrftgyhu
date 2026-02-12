import { NextRequest } from "next/server";
import { advertisers, advertiserBanks } from "@/lib/mock-data";
import type { AdvertiserBankAccountUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; bankId: string }> }
) {
  const { id: advertiserId, bankId } = await params;
  if (!advertisers.get(advertiserId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Advertiser not found" } },
      { status: 404 }
    );
  }
  const b = advertiserBanks.get(bankId);
  if (!b || b.advertiser_id !== advertiserId || b.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Bank account not found" } },
      { status: 404 }
    );
  }
  return Response.json(b);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bankId: string }> }
) {
  const { id: advertiserId, bankId } = await params;
  const b = advertiserBanks.get(bankId);
  if (!b || b.advertiser_id !== advertiserId || b.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Bank account not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as AdvertiserBankAccountUpdate;
  const updated = { ...b, ...body, updated_at: new Date().toISOString() };
  advertiserBanks.set(bankId, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; bankId: string }> }
) {
  const { id: advertiserId, bankId } = await params;
  const b = advertiserBanks.get(bankId);
  if (!b || b.advertiser_id !== advertiserId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Bank account not found" } },
      { status: 404 }
    );
  }
  advertiserBanks.set(bankId, { ...b, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
