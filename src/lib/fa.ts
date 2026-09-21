/** Persian-Indic digits for numbers shown inside Persian copy. */
export const faDigits = (value: number | string) => String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);

/** Two-digit Persian ordinal, "۰۱" … "۵۰". */
export const faIndex = (n: number) => faDigits(String(n).padStart(2, "0"));
