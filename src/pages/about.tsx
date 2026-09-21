import Link from "next/link";
import type { PageConfig } from "next";
import { Shell } from "@/components/site/Shell";
import { VENUE } from "@/data/venue";

export const config: PageConfig = { unstable_runtimeJS: false };

export default function AboutPage() {
  return (
    <Shell title="درباره ما" description={`${VENUE.tagline} ${VENUE.invitation}`} path="/about">
      <p className="eyebrow">درباره ما</p>
      <h1 className="statement">{VENUE.tagline}</h1>
      <p className="lede">{VENUE.invitation}</p>

      <ol className="pillars">
        {VENUE.pillars.map((p, i) => (
          <li key={p}>
            <span className="pillar-num" dir="ltr">
              0{i + 1}
            </span>
            <span className="pillar-name">{p}</span>
          </li>
        ))}
      </ol>

      <div className="page-cta">
        <Link className="button" href="/contact">
          آدرس و ساعات کاری
        </Link>
        <Link className="button ghost" href="/">
          نوشیدنی‌ها
        </Link>
      </div>
    </Shell>
  );
}
