/** The café itself: copy for the About and Contact pages (Persian, RTL). */
export const VENUE = {
  tagline: "قهوه تخصصی، دسرهای هنری و جامعه‌ای که حالیشه.",
  invitation: "ما را در قلب رشت بیابید — جایی که باران با گرما ملاقات می‌کند.",
  /** The three promises in the tagline, one per line. */
  pillars: ["قهوه تخصصی", "دسرهای هنری", "جامعه‌ای که حالیشه"],
  address: ["گلسار، بلوار دیلمان", "روبروی کوچه بوستان", "رشت، گیلان، ایران"],
  phone: { display: "+98 912 953 0911", tel: "+989129530911" },
  hours: [
    { days: "شنبه تا پنج‌شنبه", time: "۷ تا ۲۳" },
    { days: "جمعه", time: "۹ تا ۲۳" },
  ],
  city: "رشت",
  region: "رشت، گیلان",
} as const;

/** Google Maps search for the address as written above. */
export const MAPS_URL = "https://maps.google.com/?q=" + encodeURIComponent(VENUE.address.join("، "));
