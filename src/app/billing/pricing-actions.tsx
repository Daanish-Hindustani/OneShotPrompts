"use client";

import type { SubscriptionTier } from "@prisma/client";
import { useState } from "react";

export default function BillingActions({ tier }: { tier: SubscriptionTier | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(targetTier: SubscriptionTier) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.checkoutUrl) {
        setError(payload?.error ?? "Unable to start checkout.");
        return;
      }
      window.location.href = payload.checkoutUrl;
    } catch {
      setError("Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal");
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.portalUrl) {
        setError(payload?.error ?? "Unable to open billing portal.");
        return;
      }
      window.location.href = payload.portalUrl;
    } catch {
      setError("Unable to open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {tier ? (
        <button
          type="button"
          onClick={() => startCheckout(tier)}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : "Choose plan"}
        </button>
      ) : (
        <button
          type="button"
          onClick={openPortal}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : "Open customer portal"}
        </button>
      )}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
