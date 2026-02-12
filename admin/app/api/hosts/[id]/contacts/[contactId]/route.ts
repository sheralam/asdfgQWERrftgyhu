import { NextRequest } from "next/server";
import { hosts, hostContacts } from "@/lib/mock-data";
import type { HostContactUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { id: hostId, contactId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const c = hostContacts.get(contactId);
  if (!c || c.host_id !== hostId || c.deleted_at) {
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
  const { id: hostId, contactId } = await params;
  const c = hostContacts.get(contactId);
  if (!c || c.host_id !== hostId || c.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Contact not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as HostContactUpdate;
  const updated = { ...c, ...body, updated_at: new Date().toISOString() };
  hostContacts.set(contactId, updated);
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { id: hostId, contactId } = await params;
  const c = hostContacts.get(contactId);
  if (!c || c.host_id !== hostId) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Contact not found" } },
      { status: 404 }
    );
  }
  hostContacts.set(contactId, { ...c, deleted_at: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
