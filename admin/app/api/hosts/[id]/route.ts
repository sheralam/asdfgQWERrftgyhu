import { NextRequest } from "next/server";
import { hosts } from "@/lib/mock-data";
import type { HostUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const h = hosts.get(id);
  if (!h || h.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  return Response.json(h);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const h = hosts.get(id);
  if (!h || h.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as HostUpdate;
  const updated = { ...h, ...body, updated_at: new Date().toISOString() };
  hosts.set(id, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const h = hosts.get(id);
  if (!h) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  hosts.set(id, { ...h, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
