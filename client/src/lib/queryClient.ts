import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper to throw proper error with fallback message
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data.message || `${res.status}: ${res.statusText}`);
    } catch {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
  }
}

// Include JWT token from localStorage if available
function buildHeaders(contentType: boolean = false): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {};

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (contentType) headers["Content-Type"] = "application/json";

  return headers;
}

// Generic API request wrapper
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: buildHeaders(!!data),
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

// QueryFn with optional 401 fallback
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const res = await fetch(url, {
      headers: buildHeaders(),
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };
};

// Global QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
    mutations: {
      retry: false,
    },
  },
});
