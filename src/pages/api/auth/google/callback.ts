import type { NextApiRequest, NextApiResponse } from "next";
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/auth/http";
import { readCookie, safeEqual, setCookie, startSession } from "@/lib/auth/session";

type IdToken = { aud?: string; iss?: string; exp?: number; email?: string; email_verified?: boolean; name?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const back = (error: string) => res.redirect(303, `/login?error=${error}`);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return back("google_unavailable");

  const { code, state, error } = req.query;
  const expected = readCookie(req, GOOGLE_STATE_COOKIE);
  setCookie(res, GOOGLE_STATE_COOKIE, "", 0);
  if (error === "access_denied") return back("google_cancelled");
  if (typeof code !== "string" || typeof state !== "string" || !expected || !safeEqual(state, expected)) {
    return back("google_failed");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(req),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return back("google_failed");
  const { id_token } = (await tokenRes.json()) as { id_token?: string };

  // received directly from Google's token endpoint over TLS, so the payload can be read without verifying the signature
  const payload = id_token?.split(".")[1];
  let claims: IdToken;
  try {
    claims = JSON.parse(Buffer.from(payload ?? "", "base64url").toString()) as IdToken;
  } catch {
    return back("google_failed");
  }
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (claims.aud !== clientId || !issuerOk || !claims.email || !claims.email_verified || (claims.exp ?? 0) * 1000 < Date.now()) {
    return back("google_failed");
  }

  startSession(res, { sub: claims.email.toLowerCase(), via: "google", name: claims.name });
  res.redirect(303, "/login");
}
