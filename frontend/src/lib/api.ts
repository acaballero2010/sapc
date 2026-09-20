const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit & { timeoutMs?: number } = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sapc_token") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  // Create AbortController with configurable timeout (default 15s for Gemini AI / backend responses)
  const controller = new AbortController();
  const timeoutDuration = options.timeoutMs ?? 15000;
  const timeoutId = setTimeout(() => {
    try {
      controller.abort("Backend request timed out (offline fallback mode)");
    } catch {
      controller.abort();
    }
  }, timeoutDuration);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = "An unexpected error occurred";
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Gracefully normalize AbortError / offline connection errors
    if (err?.name === "AbortError" || err?.message?.includes("aborted") || err?.message?.includes("Failed to fetch")) {
      const silentError = new Error("Backend offline or unreachable");
      silentError.name = "OfflineError";
      throw silentError;
    }
    throw err;
  }
}

export { API_BASE_URL };
