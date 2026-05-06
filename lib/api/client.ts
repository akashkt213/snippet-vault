export class ApiError extends Error {
  status: number;
  url: string;
  body: unknown;

  constructor(message: string, status: number, url: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length ? text : null;
}

function shouldRetry(status: number) {
  return status >= 500 || status === 429;
}

async function request<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    headers,
    ...fetchOptions
  } = options;

  let attempt = 0;
  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: controller.signal,
      });

      const body = await parseResponseBody(response);

      if (!response.ok) {
        if (attempt < retries && shouldRetry(response.status)) {
          attempt += 1;
          await sleep(retryDelayMs * attempt);
          continue;
        }
        throw new ApiError(`Request failed with status ${response.status}`, response.status, url, body);
      }

      return body as T;
    } catch (error) {
      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      const isNetworkError = error instanceof TypeError;

      if (attempt < retries && (isAbortError || isNetworkError)) {
        attempt += 1;
        await sleep(retryDelayMs * attempt);
        continue;
      }

      if (isAbortError) {
        throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408, url);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new ApiError("Request failed after retries", 500, url);
}

export const apiClient = {
  get: <T>(url: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    request<T>(url, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
