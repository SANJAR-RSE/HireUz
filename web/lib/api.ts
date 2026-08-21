const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hireuz_token");
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  isForm?: boolean;
  auth?: boolean;
};

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isForm = false, auth = true } = options;

  const headers: Record<string, string> = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.", 0);
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : null) || "Kutilmagan xatolik yuz berdi";
    throw new ApiError(message, res.status);
  }

  return data as T;
}
