import { cookies } from "next/headers";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase is not configured.");
}

export async function supabaseRequest(path, { method = "GET", body, accessToken, headers = {}, cache = "no-store" } = {}) {
  requireConfig();
  const h = new Headers(headers);
  h.set("apikey", SUPABASE_KEY);
  h.set("Accept", "application/json");
  if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);
  if (body !== undefined && !(body instanceof FormData)) h.set("Content-Type", "application/json");
  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers: h, body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined, cache });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error_description || data?.error || `Supabase request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function supabaseAdminRequest(path, { method = "GET", body, headers = {}, cache = "no-store" } = {}) {
  if (!SUPABASE_SECRET_KEY) throw new Error("Supabase server secret is not configured.");
  const h = new Headers(headers); h.set("apikey", SUPABASE_SECRET_KEY); h.set("Authorization", `Bearer ${SUPABASE_SECRET_KEY}`); h.set("Accept", "application/json");
  if (body !== undefined) h.set("Content-Type", "application/json");
  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers:h, body:body!==undefined?JSON.stringify(body):undefined, cache });
  const text=await res.text(); let data=null; try{data=text?JSON.parse(text):null}catch{data=text;}
  if(!res.ok){const err=new Error(data?.message||data?.error_description||data?.error||`Supabase request failed (${res.status})`);err.status=res.status;throw err;} return data;
}

export async function authTokenRequest(grantType, payload) {
  return supabaseRequest(`/auth/v1/token?grant_type=${encodeURIComponent(grantType)}`, { method: "POST", body: payload });
}

export async function signUp(email, password, name) {
  return supabaseRequest("/auth/v1/signup", { method: "POST", body: { email, password, data: { name, full_name: name }, email_redirect_to: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback` } });
}

export async function getAccessToken() {
  const store = await cookies();
  return store.get("hb_access_token")?.value || null;
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get("hb_refresh_token")?.value || null;
}

export async function getAuthUser(accessToken) {
  const token = accessToken ?? await getAccessToken();
  if (!token) return null;
  try { return await supabaseRequest("/auth/v1/user", { accessToken: token }); } catch { return null; }
}

export async function getProfile(accessToken) {
  const user = await getAuthUser(accessToken);
  if (!user?.id) return null;
  const rows = await supabaseRequest(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=*`, { accessToken });
  return rows?.[0] || null;
}

export async function requireUser() {
  const user = await getAuthUser();
  if (!user) { const e = new Error("Authentication required"); e.code = "AUTH_REQUIRED"; throw e; }
  return user;
}

export async function requireAdmin() {
  const token = await getAccessToken();
  const user = await getAuthUser(token);
  if (!user) { const e = new Error("Authentication required"); e.code = "AUTH_REQUIRED"; throw e; }
  const rows = await supabaseRequest(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role,email,full_name`, { accessToken: token });
  const profile = rows?.[0];
  if (profile?.role !== "admin") { const e = new Error("Admin access required"); e.code = "FORBIDDEN"; throw e; }
  return { user, profile, accessToken: token };
}

export function authCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge };
}
