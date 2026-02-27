import type { ApiResponse } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasApiShape<T>(value: unknown): value is ApiResponse<T> {
  if (!isRecord(value)) return false;
  return "Success" in value && "Data" in value;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    if (hasApiShape<unknown>(body)) {
      throw new Error((body.Message as string) || `Request failed (${res.status})`);
    }
    throw new Error(typeof body === "string" ? body : `Request failed (${res.status})`);
  }

  if (!hasApiShape<T>(body)) {
    throw new Error("Unexpected server response shape");
  }

  if (body.Success === false) {
    throw new Error(body.Message || "Request failed");
  }

  return body;
}

export const http = {
  async data<T>(path: string, options?: RequestInit): Promise<T> {
    const result = await request<T>(path, options);
    return result.Data;
  },

  async raw<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(path, options);
  },
};
