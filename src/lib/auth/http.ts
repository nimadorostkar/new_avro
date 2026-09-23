import type { NextApiRequest, NextApiResponse } from "next";
import { SITE } from "@/lib/site";

export type ApiError =
  | "invalid_target"
  | "invalid_code"
  | "wrong_code"
  | "expired"
  | "locked"
  | "too_many"
  | "unavailable"
  | "bad_request";

export const fail = (res: NextApiResponse, status: number, error: ApiError, extra?: object) =>
  res.status(status).json({ error, ...extra });

/** POST with a JSON body from this origin only; anything else is refused before touching state. */
export function acceptJsonPost(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return false;
  }
  const origin = req.headers.origin;
  if (origin && origin !== requestOrigin(req)) {
    fail(res, 403, "bad_request");
    return false;
  }
  if (!req.headers["content-type"]?.startsWith("application/json") || typeof req.body !== "object" || !req.body) {
    fail(res, 400, "bad_request");
    return false;
  }
  return true;
}

/** The canonical origin in production; whatever host served the request locally. */
export function requestOrigin(req: NextApiRequest): string {
  if (process.env.NODE_ENV === "production") return SITE.url;
  return `http://${req.headers.host ?? "localhost:3000"}`;
}

export const GOOGLE_STATE_COOKIE = "avro_google_state";
export const googleRedirectUri = (req: NextApiRequest) => `${requestOrigin(req)}/api/auth/google/callback`;

export const clientIp = (req: NextApiRequest) =>
  String(req.headers["x-forwarded-for"] ?? "").split(",")[0]!.trim() || req.socket.remoteAddress || "unknown";
