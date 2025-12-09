import { getIdToken } from './firebase';

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await getIdToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
