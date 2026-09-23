import type { NextApiRequest, NextApiResponse } from "next";
import { endSession } from "@/lib/auth/session";
import { requestOrigin } from "@/lib/auth/http";

/** A plain form POST, so signing out works without JavaScript. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const origin = req.headers.origin;
  if (origin && origin !== requestOrigin(req)) return res.status(403).end();
  endSession(res);
  res.redirect(303, "/login");
}
