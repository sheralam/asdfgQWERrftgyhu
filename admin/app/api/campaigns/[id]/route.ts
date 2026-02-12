import { NextRequest } from "next/server";
import { campaigns } from "@/lib/mock-data";
import type { CampaignUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const c = campaigns.get(id);
  if (!c || c.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Campaign not found" } },
      { status: 404 }
    );
  }
  return Response.json(c);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const c = campaigns.get(id);
  if (!c || c.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Campaign not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as CampaignUpdate;
  const updated = { ...c, ...body, updated_at: new Date().toISOString() };
  campaigns.set(id, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const c = campaigns.get(id);
  if (!c) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Campaign not found" } },
      { status: 404 }
    );
  }
  campaigns.set(id, { ...c, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
