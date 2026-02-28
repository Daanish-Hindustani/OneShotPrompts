import { describe, expect, it } from "vitest";

import { LANDING_NAV_LINKS } from "../src/lib/landing-nav";

describe("LANDING_NAV_LINKS", () => {
  it("exposes in-page anchors for the landing navigation", () => {
    expect(LANDING_NAV_LINKS).toEqual([
      { href: "#contact", label: "Contact" },
      { href: "#pricing", label: "Pricing Plans" },
    ]);
  });
});
