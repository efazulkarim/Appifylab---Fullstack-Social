import type { ApiEnvelope } from "@appifylab/shared";

let csrfTokenCache: string | null = null;

// Helper to get csrf token from document.cookie
function getCsrfFromCookie(): string | null {
  const match = document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

// Fetch CSRF token from server
export async function fetchCsrfToken(): Promise<string> {
  const token = getCsrfFromCookie();
  if (token) {
    csrfTokenCache = token;
    return token;
  }
  
  const res = await fetch("/api/auth/csrf", { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }
  const json = await res.json() as ApiEnvelope<{ csrfToken: string }>;
  csrfTokenCache = json.data.csrfToken;
  return json.data.csrfToken;
}

export class ApiError extends Error {
  public code: string;
  public details?: any;
  public statusCode?: number;

  constructor(
    code: string,
    message: string,
    details?: any,
    statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

interface RequestOptions extends RequestInit {
  json?: any;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : path;
  
  const headers = new Headers(options.headers);
  
  // For state-changing methods, fetch and attach CSRF token
  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let token = csrfTokenCache || getCsrfFromCookie();
    if (!token) {
      token = await fetchCsrfToken();
    }
    if (token) {
      headers.set("x-csrf-token", token);
    }
  }

  if (options.json) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
  }

  // Include credentials (cookies)
  options.credentials = "include";
  options.headers = headers;

  const response = await fetch(url, options);

  if (response.status === 204) {
    return null as any;
  }

  let responseData: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = { data: await response.text() };
  }

  if (!response.ok) {
    const errorPayload = responseData?.error;
    throw new ApiError(
      errorPayload?.code || "HTTP_ERROR",
      errorPayload?.message || response.statusText,
      errorPayload?.details,
      response.status
    );
  }

  return responseData as T;
}
