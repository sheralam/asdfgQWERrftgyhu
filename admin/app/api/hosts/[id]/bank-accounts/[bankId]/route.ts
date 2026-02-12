import { NextRequest } from "next/server";
import { hosts, hostBanks } from "@/lib/mock-data";
import type { HostBankAccountUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; bankId: string }> }
) {
  const { id: hostId, bankId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const b = hostBanks.get(bankId);
  if (!b || b.host_id !== hostId || b.deleted_at) {
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
  const { id: hostId, bankId } = await params;
  const b = hostBanks.get(bankId);
  if (!b || b.host_id !== hostId || b.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Bank account not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as HostBankAccountUpdate;
  const updated = { ...b, ...body, updated_at: new Date().toISOString() };
  hostBanks.set(bankId, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; bankId: string }> }
) {
  const { id: hostId, bankId } = await params;
  const b = hostBanks.get(bankId);
  if (!b || b.host_id !== hostId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Bank account not found" } },
      { status: 404 }
    );
  }
  hostBanks.set(bankId, { ...b, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
