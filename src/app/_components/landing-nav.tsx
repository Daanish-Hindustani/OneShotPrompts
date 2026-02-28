import Link from "next/link";
import { LANDING_NAV_LINKS } from "@/lib/landing-nav";

export default function LandingNav() {
  return (
    <header className="bg-white">
      <div className="flex flex-col gap-6 px-6 py-6 sm:px-10 lg:h-[110px] lg:flex-row lg:items-center lg:justify-between lg:px-16">
        <Link
          className="flex-1 text-[2rem] font-black uppercase leading-[1.1] tracking-[-0.03em] text-black sm:text-[2.75rem] lg:text-[56px]"
          href="/"
        >
          One Shot Prompts
        </Link>

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-base font-medium leading-[1.45] tracking-[-0.005em] text-black lg:gap-10">
          {LANDING_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              className="transition-opacity hover:opacity-60"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="transition-opacity hover:opacity-60"
            href="/api/auth/signin?callbackUrl=/projects"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
