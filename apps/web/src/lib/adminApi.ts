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

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export async function adminFetch<T = unknown>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
  } = {}
): Promise<ApiResult<T>> {
  try {
    const r = await fetch(`${API_URL}/api${path}`, {
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

    if (r.status === 401 && !path.startsWith('/auth/login')) {
      window.location.href = '/admin/login';
    }

    const j = await r.json().catch(() => ({}));

    return {
      ok: r.ok,
      status: r.status,
      data: j.data,
      error: j.error,
      details: j.details,
      meta: j.meta,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'Network error',
    };
  }
}
