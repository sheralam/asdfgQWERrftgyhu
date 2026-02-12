import { NextRequest } from "next/server";
import { hosts, hostBanks, uuid, now } from "@/lib/mock-data";
import type { HostBankAccountCreate, HostBankAccountListResponse } from "@/lib/types";

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
  const list = Array.from(hostBanks.values()).filter(
    (b) => b.host_id === hostId && !b.deleted_at
  );
  const data = list.slice(offset, offset + limit);
  const body: HostBankAccountListResponse = {
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
  const body = (await request.json()) as HostBankAccountCreate;
  const bankId = uuid();
  const bank = {
    bank_id: bankId,
    host_id: hostId,
    bank_name: body.bank_name,
    bank_account_number: body.bank_account_number,
    bank_account_name: body.bank_account_name,
    bank_account_routing_number: null,
    bank_account_swift_code: null,
    bank_account_iban: null,
    bank_account_bic: null,
    bank_account_currency: body.bank_account_currency,
    is_default: body.is_default ?? false,
    is_verified: body.is_verified ?? false,
    is_sepa_compliant: body.is_sepa_compliant ?? false,
    created_at: now(),
    updated_at: null,
    deleted_at: null,
  };
  hostBanks.set(bankId, bank);
  return Response.json(bank, { status: 201 });
}
