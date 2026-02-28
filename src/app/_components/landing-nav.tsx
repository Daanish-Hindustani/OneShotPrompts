import Link from "next/link";
import { Archivo_Black, Manrope } from "next/font/google";

import AuthButtons from "@/app/_components/auth-buttons";
import { LANDING_NAV_LINKS } from "@/lib/landing-nav";

const brandFont = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
});

const navFont = Manrope({
  subsets: ["latin"],
  weight: ["500", "700"],
});

export default function LandingNav() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <Link
          className={`${brandFont.className} text-[1.65rem] uppercase leading-none tracking-[-0.06em] text-slate-950 sm:text-[2.15rem] lg:text-[2.6rem]`}
          href="/"
        >
          One Shot Prompts
        </Link>

        <div
          className={`${navFont.className} flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-900 sm:gap-x-8`}
        >
          {LANDING_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              className="transition-opacity hover:opacity-60"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <AuthButtons variant="nav" />
        </div>
      </div>
    </header>
  );
}
