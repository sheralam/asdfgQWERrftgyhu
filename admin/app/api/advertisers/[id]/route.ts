import { NextRequest } from "next/server";
import { advertisers } from "@/lib/mock-data";
import type { AdvertiserUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const a = advertisers.get(id);
  if (!a || a.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Advertiser not found" } },
      { status: 404 }
    );
  }
  return Response.json(a);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const a = advertisers.get(id);
  if (!a || a.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Advertiser not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as AdvertiserUpdate;
  const updated = {
    ...a,
    ...body,
    updated_at: new Date().toISOString(),
  };
  advertisers.set(id, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const a = advertisers.get(id);
  if (!a) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Advertiser not found" } },
      { status: 404 }
    );
  }
  advertisers.set(id, { ...a, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
