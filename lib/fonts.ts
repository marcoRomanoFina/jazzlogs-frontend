import { DM_Sans, Fraunces, Newsreader } from "next/font/google";

// The default UI sans — everything that isn't a Fraunces headline or a
// Newsreader long-form paragraph (buttons, labels, stats, nav, the small
// uppercase eyebrow labels that used to be DM Mono) falls back to this.
// Replaces Archivo.
export const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Headlines — a warm serif with soft, hand-painted-looking curves, picked to
// go with the brush-stroke imagery. `axes: ["SOFT"]` pulls in Fraunces' own
// variable "soft" axis (rounds the curves further); not dialed in per
// element yet, just available via the CSS var if/when we want to tune it.
// `weight: "variable"` (not a static array) is required for `axes` to apply
// at all — a static-weight array loads discrete cuts of the font instead of
// the variable instance, which is what broke the build (next/font/google
// can't generate a stylesheet for axes that don't exist on a static cut).
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT"],
});

// Long-form reading text (deks, descriptions) — built for exactly that on
// screen, unlike DM Sans which is a display/UI sans.
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
