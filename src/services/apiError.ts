import axios from "axios";

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export function getApiErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred";

  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    if (!err.response) {
      return "Network error. Please check your connection.";
    }

    if (err.response.status === 401) {
      return "Unauthorized. Please log in.";
    }

    if (err.response.status === 403) {
      return "Access denied.";
    }

    if (err.response.status >= 500) {
      return "Server error. Please try again later.";
    }

    return err.response.data?.error ?? err.response.data?.message ?? "Request failed";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "An unexpected error occurred";
}
