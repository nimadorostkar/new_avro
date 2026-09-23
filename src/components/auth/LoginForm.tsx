import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { OTP_LENGTH, displayPhone, latinDigits, normalize, type Channel } from "@/lib/auth/identity";
import { faDigits } from "@/lib/fa";

const COPY = {
  title: { strong: "خوش برگشتید،", rest: " وارد حساب خود شوید" },
  codeTitle: { strong: "کد تأیید", rest: " را وارد کنید" },
  label: { phone: "شماره موبایل", email: "آدرس ایمیل" },
  placeholder: { phone: "0912 123 4567", email: "name@gmail.com" },
  switchTo: { phone: "ورود با ایمیل", email: "ورود با موبایل" },
  remember: "مرا به خاطر بسپار",
  send: "دریافت کد",
  sending: "در حال ارسال…",
  sentTo: (n: number) => `کد ${faDigits(n)} رقمی ارسال شد به`,
  edit: "ویرایش",
  verify: "ورود",
  verifying: "در حال بررسی…",
  resend: "ارسال دوباره کد",
  resendIn: (s: number) => `ارسال دوباره تا ${faDigits(s)} ثانیه دیگر`,
  codeLabel: "کد تأیید",
  or: "یا",
  google: "ورود با حساب گوگل",
  newHere: "تازه‌وارد هستید؟",
  newHereNote: "حساب شما با اولین ورود ساخته می‌شود.",
} as const;

const ERRORS: Record<string, string> = {
  invalid_phone: "شماره موبایل معتبر نیست. نمونه: ⁦۰۹۱۲ ۱۲۳ ۴۵۶۷⁩",
  invalid_email: "آدرس ایمیل معتبر نیست. نمونه: name@gmail.com",
  invalid_code: `کد باید ${faDigits(OTP_LENGTH)} رقم باشد.`,
  wrong_code: "کد وارد شده درست نیست. دوباره امتحان کنید.",
  expired: "این کد منقضی شده است. کد تازه بگیرید.",
  locked: "تعداد تلاش‌ها زیاد شد. کد تازه بگیرید.",
  unavailable: "ارسال کد در حال حاضر ممکن نیست. از ورود با گوگل استفاده کنید.",
  network: "اتصال برقرار نشد. اینترنت خود را بررسی کنید.",
  google_unavailable: "ورود با گوگل هنوز فعال نشده است. با موبایل یا ایمیل وارد شوید.",
  google_cancelled: "ورود با گوگل لغو شد.",
  google_failed: "ورود با گوگل انجام نشد. دوباره امتحان کنید.",
  unknown: "مشکلی پیش آمد. دوباره امتحان کنید.",
};
const tooMany = (s: number) =>
  s > 90 ? "درخواست‌ها بیش از حد مجاز شد. کمی بعد دوباره امتحان کنید." : `درخواست زیاد شد. ${faDigits(s)} ثانیه دیگر دوباره امتحان کنید.`;

type ApiResult = { ok: boolean; data: { error?: string; retryAfter?: number; resendIn?: number } };

async function post(url: string, body: object): Promise<ApiResult> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { error: "network" } };
  }
}

const messageFor = ({ error, retryAfter }: ApiResult["data"]) =>
  error === "too_many" ? tooMany(retryAfter ?? 60) : ERRORS[error ?? ""] ?? ERRORS.unknown!;

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("phone");
  const [values, setValues] = useState({ phone: "", email: "" });
  const [remember, setRemember] = useState(true);
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ? ERRORS[initialError] ?? ERRORS.unknown! : "");
  const [resendIn, setResendIn] = useState(0);
  const idRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const focusId = useRef(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
    else if (focusId.current) idRef.current?.focus();
    focusId.current = false;
  }, [step, channel]);

  const toggleChannel = () => {
    if (busy) return;
    focusId.current = true;
    setChannel((c) => (c === "phone" ? "email" : "phone"));
    setError("");
  };

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    const to = normalize(channel, values[channel]);
    if (!to) {
      setError(ERRORS[`invalid_${channel}`]!);
      idRef.current?.focus();
      return;
    }
    // same number, code still fresh: go back to it instead of hitting the resend cooldown
    if (to === target && resendIn > 0) {
      setError("");
      setCode("");
      setStep("code");
      return;
    }
    setBusy(true);
    setError("");
    const r = await post("/api/auth/otp/send", { channel, target: to });
    setBusy(false);
    if (!r.ok) {
      setError(messageFor(r.data));
      return;
    }
    setTarget(to);
    setCode("");
    setResendIn(r.data.resendIn ?? 60);
    setStep("code");
  }

  async function verify(value = code) {
    if (busy) return;
    if (value.length !== OTP_LENGTH) {
      setError(ERRORS.invalid_code!);
      codeRef.current?.focus();
      return;
    }
    setBusy(true);
    setError("");
    const r = await post("/api/auth/otp/verify", { channel, target, code: value, remember });
    if (r.ok) {
      await router.replace("/login");
      return;
    }
    setBusy(false);
    setError(messageFor(r.data));
    setCode("");
    codeRef.current?.focus();
  }

  const onCode = (raw: string) => {
    const next = latinDigits(raw).replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(next);
    if (error) setError("");
    if (next.length === OTP_LENGTH) void verify(next);
  };

  const errorId = "login-error";

  if (step === "code") {
    return (
      <form
        className="auth-form auth-step"
        onSubmit={(e) => {
          e.preventDefault();
          void verify();
        }}
        noValidate
      >
        <h1 className="auth-title">
          <strong>{COPY.codeTitle.strong}</strong>
          {COPY.codeTitle.rest}
        </h1>
        <p className="auth-sent">
          {COPY.sentTo(OTP_LENGTH)}{" "}
          <bdi dir="ltr" className="auth-target">
            {channel === "phone" ? displayPhone(target) : target}
          </bdi>{" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              focusId.current = true;
              setError("");
              setStep("enter");
            }}
            disabled={busy}
          >
            {COPY.edit}
          </button>
        </p>

        <label className="sr-only" htmlFor="login-code">
          {COPY.codeLabel}
        </label>
        <div className={`otp${error ? " otp-error" : ""}`} dir="ltr">
          <input
            ref={codeRef}
            id="login-code"
            className="otp-input"
            name="one-time-code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            value={code}
            onChange={(e) => onCode(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            disabled={busy}
          />
          {Array.from({ length: OTP_LENGTH }, (_, i) => (
            <span
              key={i}
              className="otp-cell"
              data-filled={i < code.length || undefined}
              data-active={i === Math.min(code.length, OTP_LENGTH - 1) || undefined}
              aria-hidden="true"
            >
              {code[i] ?? ""}
            </span>
          ))}
        </div>
        <ErrorLine id={errorId} message={error} />

        <button className="auth-submit" type="submit" disabled={busy || code.length !== OTP_LENGTH} aria-busy={busy}>
          {busy ? COPY.verifying : COPY.verify}
        </button>
        <p className="auth-resend">
          {resendIn > 0 ? (
            <span>{COPY.resendIn(resendIn)}</span>
          ) : (
            <button type="button" className="auth-link" onClick={() => void send()} disabled={busy}>
              {COPY.resend}
            </button>
          )}
        </p>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={send} noValidate>
      <h1 className="auth-title">
        <strong>{COPY.title.strong}</strong>
        {COPY.title.rest}
      </h1>

      <div className="field">
        <input
          key={channel}
          ref={idRef}
          id="login-id"
          className="field-input"
          dir="ltr"
          name={channel === "phone" ? "tel" : "email"}
          type={channel === "phone" ? "tel" : "email"}
          inputMode={channel === "phone" ? "tel" : "email"}
          autoComplete={channel === "phone" ? "tel" : "email"}
          placeholder={COPY.placeholder[channel]}
          value={values[channel]}
          onChange={(e) => {
            setValues((v) => ({ ...v, [channel]: e.target.value }));
            if (error) setError("");
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={busy}
        />
        <label className="field-label" htmlFor="login-id">
          {COPY.label[channel]}
        </label>
      </div>

      <div className="auth-row">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span className="check-box" aria-hidden="true" />
          {COPY.remember}
        </label>
        <button type="button" className="auth-link auth-link-quiet" onClick={toggleChannel} disabled={busy}>
          {COPY.switchTo[channel]}
        </button>
      </div>
      <ErrorLine id={errorId} message={error} />

      <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
        {busy ? COPY.sending : COPY.send}
      </button>

      <p className="auth-or">
        <span>{COPY.or}</span>
      </p>

      {/* a full navigation: the route answers with a redirect to Google, which client-side routing cannot follow */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="auth-google" href="/api/auth/google">
        <GoogleMark />
        <span>{COPY.google}</span>
      </a>

      <p className="auth-foot">
        {COPY.newHere} <span>{COPY.newHereNote}</span>
      </p>
    </form>
  );
}

function ErrorLine({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="auth-error" role="alert" aria-live="assertive">
      {message}
    </p>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
