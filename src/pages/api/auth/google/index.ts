import { randomBytes } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/auth/http";
import { setCookie } from "@/lib/auth/session";

/** Starts "Sign in with Google" (OAuth 2.0 authorization code flow, openid + email). */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) return res.redirect(303, "/login?error=google_unavailable");

  const state = randomBytes(24).toString("base64url");
  setCookie(res, GOOGLE_STATE_COOKIE, state, 600);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  res.redirect(303, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
