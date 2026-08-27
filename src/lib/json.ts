/* Parse a JSON string, or fall back when it is null or malformed. The one
   owner of this defensive parse — the LMS auth and repository layers both read
   namespaced JSON out of localStorage and must never throw on a corrupt or
   absent value. */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
