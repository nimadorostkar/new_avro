import type { Channel } from "./identity";

export class DeliveryUnavailable extends Error {}

/**
 * Sends the one-time code. Locally the code is printed to the dev-server log.
 * In production, plug the SMS gateway (e.g. Kavenegar) and the email provider
 * in here; until then the API answers 503 instead of pretending to send.
 */
export async function deliver(channel: Channel, target: string, code: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[auth] ${channel} code for ${target}: ${code}`);
    return;
  }
  throw new DeliveryUnavailable(`no ${channel} provider configured`);
}
