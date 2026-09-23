/** Shared by the login form and the API: what counts as a valid email or Iranian mobile number. */
export type Channel = "email" | "phone";

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;

/** Persian and Arabic-Indic digits typed on a Persian keyboard, as ASCII. */
export const latinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns the canonical form (lower-cased email, +989xxxxxxxxx) or null when invalid. */
export function normalize(channel: Channel, raw: string): string | null {
  const value = latinDigits(raw).trim();
  if (channel === "email") {
    const email = value.toLowerCase();
    return email.length <= 254 && EMAIL.test(email) ? email : null;
  }
  const digits = value.replace(/[\s\-()]/g, "");
  const m = /^(?:\+98|0098|0)?(9\d{9})$/.exec(digits);
  return m ? `+98${m[1]}` : null;
}

/** "+989121234567" → "0912 123 4567", for showing the number back to the user. */
export const displayPhone = (e164: string) => {
  const local = `0${e164.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
};
