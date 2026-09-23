import type { NextApiRequest, NextApiResponse } from "next";
import { acceptJsonPost, fail } from "@/lib/auth/http";
import { OTP_LENGTH, latinDigits, normalize, type Channel } from "@/lib/auth/identity";
import { check } from "@/lib/auth/otp";
import { startSession } from "@/lib/auth/session";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!acceptJsonPost(req, res)) return;
  const { channel, target, code, remember } = req.body as { channel?: unknown; target?: unknown; code?: unknown; remember?: unknown };
  if ((channel !== "email" && channel !== "phone") || typeof target !== "string" || typeof code !== "string") {
    return fail(res, 400, "bad_request");
  }
  const to = normalize(channel as Channel, target);
  if (!to) return fail(res, 422, "invalid_target");
  const digits = latinDigits(code);
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(digits)) return fail(res, 422, "invalid_code");

  switch (check(channel, to, digits)) {
    case "ok":
      startSession(res, { sub: to, via: channel }, remember !== false);
      return res.status(200).json({ ok: true });
    case "wrong":
      return fail(res, 401, "wrong_code");
    case "expired":
      return fail(res, 410, "expired");
    case "locked":
      return fail(res, 429, "locked");
  }
}
