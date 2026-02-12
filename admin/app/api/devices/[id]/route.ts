import { NextRequest } from "next/server";
import { devices, deviceDetails } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const d = devices.get(id);
  if (!d || d.deleted_at) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device not found" } },
      { status: 404 }
    );
  }
  const details = deviceDetails.get(id);
  return Response.json({ ...d, details: details ?? null });
}
