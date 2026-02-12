import { NextRequest } from "next/server";
import { devices, deviceDetails } from "@/lib/mock-data";
import type { DeviceListResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const includeDeleted = searchParams.get("include_deleted") === "true";
  const hostId = searchParams.get("host_id");
  const deviceType = searchParams.get("device_type");
  const deviceRating = searchParams.get("device_rating");

  let list = Array.from(devices.values()).filter(
    (d) => includeDeleted || !d.deleted_at
  );
  if (hostId) list = list.filter((d) => d.host_id === hostId);
  if (deviceType) list = list.filter((d) => d.device_type === deviceType);
  if (deviceRating) list = list.filter((d) => d.device_rating === deviceRating);

  const total = list.length;
  const slice = list.slice(offset, offset + limit);
  const data = slice.map((d) => {
    const details = deviceDetails.get(d.device_id);
    return { ...d, details: details ?? null };
  });

  const body: DeviceListResponse = { data, meta: { total_count: total, limit, offset } };
  return Response.json(body);
}
