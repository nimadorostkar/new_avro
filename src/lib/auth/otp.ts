import { randomInt } from "node:crypto";
import { OTP_LENGTH, RESEND_SECONDS, type Channel } from "./identity";
import { safeEqual, sign } from "./session";

const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;

type Pending = { mac: string; expires: number; attempts: number; sentAt: number; sends: number[] };

/**
 * In-process store: correct for a single `next start` instance. Running more
 * than one instance needs a shared store (Redis, the database) behind the same
 * three functions, or codes issued by one instance fail on another.
 */
const store = ((globalThis as { __avroOtp?: Map<string, Pending> }).__avroOtp ??= new Map<string, Pending>());

const key = (channel: Channel, target: string) => `${channel}:${target}`;
const macOf = (k: string, code: string) => sign(`otp:${k}:${code}`);

export type IssueResult = { ok: true; code: string } | { ok: false; retryAfter: number };

export function issue(channel: Channel, target: string): IssueResult {
  const k = key(channel, target);
  const now = Date.now();
  const prev = store.get(k);
  const sends = (prev?.sends ?? []).filter((t) => now - t < 3_600_000);
  if (prev && now - prev.sentAt < RESEND_SECONDS * 1000) {
    return { ok: false, retryAfter: Math.ceil((prev.sentAt + RESEND_SECONDS * 1000 - now) / 1000) };
  }
  if (sends.length >= MAX_SENDS_PER_HOUR) {
    return { ok: false, retryAfter: Math.ceil((sends[0]! + 3_600_000 - now) / 1000) };
  }
  const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
  store.set(k, { mac: macOf(k, code), expires: now + TTL_MS, attempts: 0, sentAt: now, sends: [...sends, now] });
  return { ok: true, code };
}

const ipSends = ((globalThis as { __avroOtpIp?: Map<string, number[]> }).__avroOtpIp ??= new Map<string, number[]>());
const MAX_SENDS_PER_IP_HOUR = 20;

/** Caps how many codes one client can request across all targets. */
export function ipAllowed(ip: string): boolean {
  const now = Date.now();
  const recent = (ipSends.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= MAX_SENDS_PER_IP_HOUR) return false;
  ipSends.set(ip, [...recent, now]);
  return true;
}

export type CheckResult = "ok" | "wrong" | "expired" | "locked";

export function check(channel: Channel, target: string, code: string): CheckResult {
  const k = key(channel, target);
  const p = store.get(k);
  if (!p || p.expires < Date.now()) return "expired";
  if (p.attempts >= MAX_ATTEMPTS) return "locked";
  p.attempts++;
  if (!safeEqual(p.mac, macOf(k, code))) return p.attempts >= MAX_ATTEMPTS ? "locked" : "wrong";
  // keep the send history so the hourly limit still applies after a successful login
  store.set(k, { ...p, mac: "", expires: 0 });
  return "ok";
}
