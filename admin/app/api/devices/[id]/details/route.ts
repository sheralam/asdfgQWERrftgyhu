import { NextRequest } from "next/server";
import { devices, deviceDetails, uuid, now } from "@/lib/mock-data";
import type { DeviceDetailsCreate, DeviceDetailsUpdate } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deviceId } = await params;
  if (!devices.get(deviceId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device not found" } },
      { status: 404 }
    );
  }
  const d = deviceDetails.get(deviceId);
  if (!d) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device details not found" } },
      { status: 404 }
    );
  }
  return Response.json(d);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deviceId } = await params;
  if (!devices.get(deviceId)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device not found" } },
      { status: 404 }
    );
  }
  if (deviceDetails.get(deviceId)) {
    return Response.json(
      { error: { code: "CONFLICT", message: "Device details already exist for this device" } },
      { status: 409 }
    );
  }
  const body = (await request.json()) as DeviceDetailsCreate;
  const details = {
    device_id: deviceId,
    ...body,
    created_at: now(),
    updated_at: null,
  };
  deviceDetails.set(deviceId, details);
  return Response.json(details, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deviceId } = await params;
  const d = deviceDetails.get(deviceId);
  if (!d) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Device details not found" } },
      { status: 404 }
    );
  }
  const body = (await request.json()) as DeviceDetailsUpdate;
  const updated = { ...d, ...body, updated_at: new Date().toISOString() };
  deviceDetails.set(deviceId, updated);
  return Response.json(updated);
}
