import type { GetServerSideProps } from "next";
import Link from "next/link";
import { CoffeeArt } from "@/components/auth/CoffeeArt";
import { LoginForm } from "@/components/auth/LoginForm";
import { Shell } from "@/components/site/Shell";
import { displayPhone } from "@/lib/auth/identity";
import { getSession, type Session } from "@/lib/auth/session";

type Props = { session: (Pick<Session, "sub" | "via"> & { name: string | null }) | null; error: string | null };

const COPY = {
  title: "ورود",
  description: "ورود به حساب AVRO! با موبایل، ایمیل یا حساب گوگل.",
  artTitle: "طلوع را بچشید",
  artNote: "بهترین نوشیدنی برای همراهی روزهایتان",
  welcome: { strong: "خوش آمدید،", rest: " وارد حساب خود شده‌اید" },
  via: { phone: "با موبایل", email: "با ایمیل", google: "با گوگل" },
  account: "حساب شما",
  menu: "دیدن منو",
  logout: "خروج از حساب",
} as const;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res, query }) => {
  res.setHeader("Cache-Control", "private, no-store");
  const s = getSession(req);
  const error = typeof query.error === "string" && /^[a-z_]{1,40}$/.test(query.error) ? query.error : null;
  return { props: { session: s ? { sub: s.sub, via: s.via, name: s.name ?? null } : null, error } };
};

export default function LoginPage({ session, error }: Props) {
  return (
    <Shell title={COPY.title} description={COPY.description} path="/login" noindex>
      <div className="auth">
        <section className="auth-panel">
          <svg className="auth-wave" viewBox="0 0 120 800" preserveAspectRatio="none" aria-hidden="true">
            <path className="auth-wave-back" d="M120 0H70C30 90 96 170 60 270S-4 420 36 520s50 190 10 280H120z" />
            <path className="auth-wave-front" d="M120 0H96C56 90 116 170 84 270S26 420 64 520s46 190 12 280H120z" />
          </svg>

          <picture className="auth-logo">
            <source type="image/avif" srcSet="/brand/avro-logo.avif" />
            <img src="/brand/avro-logo.webp" alt="AVRO!" width={400} height={103} decoding="async" />
          </picture>

          {session ? (
            <div className="auth-form">
              <h1 className="auth-title">
                <strong>{COPY.welcome.strong}</strong>
                {COPY.welcome.rest}
              </h1>
              <div className="field field-static">
                <span className="field-input" dir="ltr">
                  {session.via === "phone" ? displayPhone(session.sub) : session.sub}
                </span>
                <span className="field-label">
                  {COPY.account} · {session.name ? `${session.name} · ` : ""}
                  {COPY.via[session.via]}
                </span>
              </div>
              <Link className="auth-submit" href="/menu">
                {COPY.menu}
              </Link>
              <form method="post" action="/api/auth/logout" className="auth-logout">
                <button className="auth-link auth-link-quiet" type="submit">
                  {COPY.logout}
                </button>
              </form>
            </div>
          ) : (
            <LoginForm initialError={error ?? undefined} />
          )}
        </section>

        <div className="auth-art" aria-hidden="true">
          <CoffeeArt />
          <p className="auth-art-title">{COPY.artTitle}</p>
          <p className="auth-art-note">{COPY.artNote}</p>
        </div>
      </div>
    </Shell>
  );
}
