import { NextRequest } from "next/server";
import { hosts, hostContacts, uuid, now } from "@/lib/mock-data";
import type { HostContactCreate, HostContactListResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const list = Array.from(hostContacts.values()).filter(
    (c) => c.host_id === hostId && !c.deleted_at
  );
  const data = list.slice(offset, offset + limit);
  const body: HostContactListResponse = {
    data,
    meta: { total_count: list.length, limit, offset },
  };
  return Response.json(body);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostId } = await params;
  if (!hosts.get(hostId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Host not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as HostContactCreate;
  const contactId = uuid();
  const contact = {
    contact_id: contactId,
    host_id: hostId,
    contact_name: body.contact_name,
    contact_email: body.contact_email,
    contact_phone: body.contact_phone,
    contact_address: body.contact_address ?? null,
    contact_city: body.contact_city ?? null,
    contact_state: body.contact_state ?? null,
    contact_postal_code: body.contact_postal_code ?? null,
    contact_country: body.contact_country ?? null,
    contact_type: body.contact_type,
    is_point_of_contact: body.is_point_of_contact ?? false,
    created_at: now(),
    updated_at: null,
    deleted_at: null,
  };
  hostContacts.set(contactId, contact);
  return Response.json(contact, { status: 201 });
}
