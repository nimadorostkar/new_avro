import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type Session = { sub: string; via: "email" | "phone" | "google"; name?: string; exp: number };

const COOKIE = "avro_session";
const MAX_AGE = 60 * 60 * 24 * 30;
const isProd = process.env.NODE_ENV === "production";

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (isProd) throw new Error("AUTH_SECRET must be set (32+ characters) in production");
  // dev only: sessions reset on restart, which is fine locally
  const g = globalThis as { __avroDevSecret?: string };
  return (g.__avroDevSecret ??= randomBytes(32).toString("hex"));
}

export const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function readCookie(req: IncomingMessage, name: string): string | undefined {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

export function cookie(name: string, value: string, maxAge?: number) {
  const age = maxAge === undefined ? "" : `; Max-Age=${maxAge}`;
  return `${name}=${encodeURIComponent(value)}; Path=/${age}; HttpOnly; SameSite=Lax${isProd ? "; Secure" : ""}`;
}

function appendCookie(res: ServerResponse, value: string) {
  const prev = res.getHeader("Set-Cookie");
  const list = Array.isArray(prev) ? prev : prev ? [String(prev)] : [];
  res.setHeader("Set-Cookie", [...list, value]);
}
export const setCookie = (res: ServerResponse, name: string, value: string, maxAge?: number) =>
  appendCookie(res, cookie(name, value, maxAge));

const SHORT_AGE = 60 * 60 * 12;

/** `remember: false` gives a browser-session cookie, still capped at 12 hours by the signed expiry. */
export function startSession(res: ServerResponse, s: Omit<Session, "exp">, remember = true) {
  const age = remember ? MAX_AGE : SHORT_AGE;
  const body = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + age * 1000 })).toString("base64url");
  setCookie(res, COOKIE, `${body}.${sign(body)}`, remember ? MAX_AGE : undefined);
}

export const endSession = (res: ServerResponse) => setCookie(res, COOKIE, "", 0);

export function getSession(req: IncomingMessage): Session | null {
  const raw = readCookie(req, COOKIE);
  const [body, mac] = raw?.split(".") ?? [];
  if (!body || !mac || !safeEqual(mac, sign(body))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}
