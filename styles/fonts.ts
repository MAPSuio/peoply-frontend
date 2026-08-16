import { Space_Grotesk, Space_Mono } from "next/font/google";

/**
 * The two typefaces, self-hosted by next/font at build time.
 *
 * They used to arrive over `@import url(...)` inside globals.scss, which is
 * the slowest way to ask for a font: the browser cannot even discover
 * fonts.googleapis.com until our own stylesheet has downloaded and parsed, and
 * only once that CSS arrives does it learn about fonts.gstatic.com. Two new
 * origins, each with its own DNS lookup and TLS handshake, both found late and
 * one after the other.
 *
 * Loaded from `_app` rather than `_document`. `_document` looks like the
 * natural home, since that is where <html> is and the variables want to be in
 * scope for the whole tree, but Next does not emit a font loader's stylesheet
 * for `_document`: the classes land on the element and nothing defines them.
 * That fails quietly - no build error, no console warning, just an empty
 * `--font-main` and a site rendered in Times. Verified before ruling it out.
 *
 * Exported from their own module so any future caller shares one instance;
 * calling the loader twice would emit the font twice.
 */
export const mainFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-main",
});

export const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});
