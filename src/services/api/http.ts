import type { ApiResponse } from "./types";
import { clearToken, getToken } from "@/auth/token";

//all requests automatically go to backend server ....
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
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  //reads token from localstorage .... 
  const token = getToken();
  //if token exists, u automatically attach .. you never manually attach token again..
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  
  //handling expired session .. backend tells if token invalid, frontend logs user out..
  if (res.status === 401) {
    clearToken();
    
    // login page not ready yet → safe fallback
    window.location.href = "/";
    //   window.location.href = "/login";

    throw new Error("Session expired");
  }

  //prevents crashes if backend sends empty response.. 
  const body = await parseJsonSafe(res);

  //All API errors handled in one place ..
  if (!res.ok) {
    if (hasApiShape<unknown>(body)) {
      throw new Error(
        (body.Message as string) || `Request failed (${res.status})`,
      );
    }
    throw new Error(
      typeof body === "string" ? body : `Request failed (${res.status})`,
    );
  }

  // ensures backend format .. 
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
    return result.Data; //returns onl data ..
  },

  //returns full API response ..
  async raw<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(path, options);
  },
};
