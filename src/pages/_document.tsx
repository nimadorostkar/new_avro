import { Head, Html, Main, NextScript } from "next/document";
import { SITE } from "@/lib/site";

export default function Document() {
  return (
    <Html lang={SITE.locale}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
