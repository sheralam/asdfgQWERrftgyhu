import { NextRequest } from "next/server";
import { advertisers, advertiserContacts } from "@/lib/mock-data";
import type { AdvertiserContactUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { id: advertiserId, contactId } = await params;
  if (!advertisers.get(advertiserId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Advertiser not found" } },
      { status: 404 }
    );
  }
  const c = advertiserContacts.get(contactId);
  if (!c || c.advertiser_id !== advertiserId || c.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Contact not found" } },
      { status: 404 }
    );
  }
  return Response.json(c);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { id: advertiserId, contactId } = await params;
  if (!advertisers.get(advertiserId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Advertiser not found" } },
      { status: 404 }
    );
  }
  const c = advertiserContacts.get(contactId);
  if (!c || c.advertiser_id !== advertiserId || c.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Contact not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as AdvertiserContactUpdate;
  const updated = { ...c, ...body, updated_at: new Date().toISOString() };
  advertiserContacts.set(contactId, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { id: advertiserId, contactId } = await params;
  const c = advertiserContacts.get(contactId);
  if (!c || c.advertiser_id !== advertiserId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Contact not found" } },
      { status: 404 }
    );
  }
  advertiserContacts.set(contactId, { ...c, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
