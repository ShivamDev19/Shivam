export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
};

export async function adminFetch<T = unknown>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
  } = {}
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`/api${path}`, {
      method: init.method ?? 'GET',
      credentials: 'include',
      headers:
        init.body !== undefined
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,
      body:
        init.body !== undefined
          ? JSON.stringify(init.body)
          : undefined,
    });

    if (
      response.status === 401 &&
      !path.startsWith('/auth/login')
    ) {
      window.location.href = '/admin/login';
    }

    const json = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data: json.data,
      error: json.error,
      details: json.details,
      meta: json.meta,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'Network error',
    };
  }
}
