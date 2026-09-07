import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Calls the Spring Boot backend with the current Supabase access token
 * attached as a Bearer token. Client-side only (reads the browser session).
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }

  // Several endpoints (e.g. POST/DELETE /likes) return 200/201/204 with no
  // body at all — only special-casing 204 meant a 200/201 with an empty body
  // still hit res.json(), which throws on empty input and made a perfectly
  // successful request look like a failure to the caller.
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// Matches Spring Data's PageImpl JSON shape (Page<T> return type on a
// controller serializes to this).
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// Matches UserController's actual GET /me response — id is the app-level
// user id (what NoteDto.userId etc. compare against, not the Supabase auth
// user id).
export interface Me {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export async function fetchMe(): Promise<Me> {
  return apiFetch<Me>("/me");
}
