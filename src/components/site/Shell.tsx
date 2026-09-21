import Head from "next/head";
import Link from "next/link";
import { vazirmatn } from "@/lib/fonts";
import { SITE } from "@/lib/site";

type Props = {
  /** Page title (shown in the tab) and description (meta + social). */
  title: string;
  description: string;
  path: "/about" | "/contact" | "/menu";
  /** Persian pages read right-to-left; English ones follow the landing page. */
  lang?: "fa" | "en";
  children: React.ReactNode;
};

/**
 * The frame, header and footer shared by the secondary pages: the same night,
 * glow and corner brackets as the hero, with a nav that simply wraps on small
 * screens (there is no script to open a menu here, and none is needed).
 */
export function Shell({ title, description, path, lang = "fa", children }: Props) {
  const url = `${SITE.url}${path}`;
  const dir = lang === "fa" ? "rtl" : "ltr";
  return (
    <div className={`page ${vazirmatn.variable}`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{`${title} — ${SITE.name}`}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#07110b" />
        <link rel="canonical" href={url} />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:title" content={`${title} — ${SITE.name}`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${SITE.url}/og.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="page-glow" aria-hidden="true" />
      <div className="page-frame" aria-hidden="true" />
      <header className="page-nav">
        <Link className="brand" href="/" aria-label="AVRO! home">
          <picture>
            <source type="image/avif" srcSet="/brand/avro-logo.avif" />
            <img src="/brand/avro-logo.webp" alt="AVRO!" width={400} height={103} decoding="async" fetchPriority="high" />
          </picture>
        </Link>
        <nav className="page-links" aria-label="Primary">
          {SITE.nav.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.href === path ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <a className="page-action" href={SITE.action.href}>
            {SITE.action.label}
          </a>
        </nav>
      </header>
      <main className="page-main" dir={dir} lang={lang}>
        {children}
      </main>
      <footer className="page-foot" dir={dir} lang={lang}>
        <span dir="ltr">{SITE.name}</span>
        <span>{VENUE_CITY}</span>
      </footer>
    </div>
  );
}

const VENUE_CITY = "رشت، گیلان";
