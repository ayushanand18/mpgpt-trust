"use client";

import { useEffect, useState } from "react";

type LandingSummary = {
  TodayBookings: number;
  MemberCount: number;
};

type SummaryState = {
  data: LandingSummary | null;
  error: boolean;
};

const fallbackSummary: LandingSummary = {
  TodayBookings: 0,
  MemberCount: 0,
};

export default function SummaryPanel() {
  const [{ data, error }, setState] = useState<SummaryState>({
    data: null,
    error: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/landing-summary", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch landing summary");
        }

        const payload = (await response.json()) as {
          Data?: LandingSummary;
        };

        if (isMounted) {
          setState({ data: payload.Data ?? fallbackSummary, error: false });
        }
      } catch {
        if (isMounted) {
          setState({ data: fallbackSummary, error: true });
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = data ?? fallbackSummary;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Today</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.TodayBookings} bookings</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Students can see their schedule without extra steps.
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Members</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.MemberCount} records</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Admins keep user details, roles, and credits in one flow.
        </p>
      </div>
      {error ? (
        <p className="sm:col-span-2 text-sm text-slate-500">
          Live summary is temporarily unavailable.
        </p>
      ) : null}
    </div>
  );
}
