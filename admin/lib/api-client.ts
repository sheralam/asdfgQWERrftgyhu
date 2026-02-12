import type { ApiError } from "./types";

const BASE = "";

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let err: ApiError;
    try {
      err = JSON.parse(text) as ApiError;
    } catch {
      err = {
        error: {
          code: "UNKNOWN",
          message: res.statusText || "Something went wrong",
        },
      };
    }
    throw err;
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export const api = {
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
      });
    }
    const res = await fetch(`${BASE}${url.pathname}${url.search}`);
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async delete(path: string): Promise<void> {
    const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
    if (!res.ok) await handleResponse<never>(res);
  },
};

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "error" in err) {
    const e = (err as ApiError).error;
    if (e.details?.length) {
      return e.details.map((d) => d.message || d.code).join("; ") || e.message;
    }
    return e.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}
