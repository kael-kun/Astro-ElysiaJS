// Base URL
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || window.location.origin;

/**
 * Get auth headers (reusable helper)
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Build full URL
 */
export function buildUrl(input: string): string {
  return input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
}

/**
 * Auth-aware fetch wrapper with global error handling
 */
async function authenticatedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  // Use the helper to get auth headers
  const defaultHeaders = getAuthHeaders();
  const headers = new Headers(init.headers || {});

  // Merge headers (init.headers takes precedence)
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  });

  // Build full URL
  const url = buildUrl(input);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    // Handle HTTP errors
    if (!response.ok) {
      // Parse error response if possible
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        const extractedMessage = getErrorMessage(errorData);
        errorMessage = extractedMessage || errorMessage;
      } catch {
        // Fallback to text if JSON fails
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {}
      }

      // Handle specific status codes
      if (response.status === 401) {
        // Unauthorized – clear auth and redirect
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }

      if (response.status === 403) {
        console.error("Access forbidden");
        throw new Error("Forbidden");
      }

      if (response.status >= 500) {
        console.error("Server error occurred");
        throw new Error("Internal server error");
      }

      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    // Re-throw network or other errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
}

/**
 * Helper to safely extract error message from unknown response
 */
function getErrorMessage(errorData: unknown): string | null {
  if (typeof errorData === "string") return errorData;

  if (typeof errorData === "object" && errorData !== null) {
    const obj = errorData as Record<string, unknown>;

    // Check common error field names
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.detail === "string") return obj.detail;
  }

  return null;
}

/**
 * Helper to parse JSON response
 */
async function parseJSON<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

/**
 * Create a typed fetch client
 */
const fetchClient = {
  async get<T = any>(url: string, options?: RequestInit): Promise<T> {
    const response = await authenticatedFetch(url, {
      method: "GET",
      ...options,
    });
    return parseJSON<T>(response);
  },

  async post<T = any, R = any>(url: string, data?: R, options?: RequestInit): Promise<T> {
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return parseJSON<T>(response);
  },

  async put<T = any, R = any>(url: string, data?: R, options?: RequestInit): Promise<T> {
    const response = await authenticatedFetch(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return parseJSON<T>(response);
  },

  async delete<T = any>(url: string, options?: RequestInit): Promise<T> {
    const response = await authenticatedFetch(url, {
      method: "DELETE",
      ...options,
    });
    return parseJSON<T>(response);
  },

  async patch<T = any, R = any>(url: string, data?: R, options?: RequestInit): Promise<T> {
    const response = await authenticatedFetch(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return parseJSON<T>(response);
  },
};

export default fetchClient;
