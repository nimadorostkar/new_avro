import type { NextApiRequest, NextApiResponse } from "next";
import { DeliveryUnavailable, deliver } from "@/lib/auth/deliver";
import { acceptJsonPost, clientIp, fail } from "@/lib/auth/http";
import { RESEND_SECONDS, normalize, type Channel } from "@/lib/auth/identity";
import { ipAllowed, issue } from "@/lib/auth/otp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!acceptJsonPost(req, res)) return;
  const { channel, target } = req.body as { channel?: unknown; target?: unknown };
  if ((channel !== "email" && channel !== "phone") || typeof target !== "string") return fail(res, 400, "bad_request");

  const to = normalize(channel as Channel, target);
  if (!to) return fail(res, 422, "invalid_target");
  if (!ipAllowed(clientIp(req))) return fail(res, 429, "too_many", { retryAfter: 3600 });

  const r = issue(channel, to);
  if (!r.ok) return fail(res, 429, "too_many", { retryAfter: r.retryAfter });

  try {
    await deliver(channel, to, r.code);
  } catch (e) {
    if (e instanceof DeliveryUnavailable) return fail(res, 503, "unavailable");
    throw e;
  }
  res.status(200).json({ target: to, resendIn: RESEND_SECONDS });
}
