import type { PageConfig } from "next";
import { Shell } from "@/components/site/Shell";
import { MAPS_URL, VENUE } from "@/data/venue";

export const config: PageConfig = { unstable_runtimeJS: false };

export default function ContactPage() {
  return (
    <Shell title="تماس" description={`${VENUE.invitation} ${VENUE.address.join("، ")}`} path="/contact">
      <p className="eyebrow">تماس</p>
      <h1 className="statement">{VENUE.invitation}</h1>

      <div className="cards">
        <section className="card">
          <h2>آدرس</h2>
          <address>
            {VENUE.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <a className="phone" href={`tel:${VENUE.phone.tel}`} dir="ltr">
            {VENUE.phone.display}
          </a>
          <a className="button" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            مسیریابی در نقشه
          </a>
        </section>

        <section className="card">
          <h2>ساعات کاری</h2>
          <dl className="hours">
            {VENUE.hours.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </Shell>
  );
}
