export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Library, ShieldCheck, Smartphone } from "lucide-react";

import SummaryPanel from "@/components/landing/summary-panel";
import CheatCodeListener from "@/components/utility/cheatcode";
import { Button } from "@/components/ui/button";

const studentSteps = [
  "Recharge first using the QR shown on the bookings page.",
  "Submit the UTR details, upload payment proof, and request credit addition.",
  "Use available credits to create bookings.",
  "Review past bookings and library listings from My Bookings.",
  "Update profile details from the profile page.",
];

const adminSteps = [
  "Review credit addition requests from students.",
  "Add credits after verifying payment details and proof.",
  "Add and delete library records as needed.",
  "Create bookings for students or cancel existing ones.",
  "Manage day-to-day operations from the admin dashboard.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee_0%,#fcfbf8_28%,#ffffff_100%)] text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-12 pt-5 sm:px-8 sm:pb-16 sm:pt-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image
                src="/library_logo_main.jpg"
                alt="Munshi Premchand Gramin Pustakalay logo"
                width={36}
                height={36}
                priority
                className="h-9 w-9 rounded-lg object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Sarwan, Deoghar, Jharkhand
              </p>
              <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                Munshi Premchand Gramin Pustakalay
              </h1>
            </div>
          </div>

          <Button asChild variant="outline" className="h-10 rounded-full px-4 text-sm">
            <Link href="/auth">Login</Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              Rural reading and learning, organised better
            </div>

            <div className="mt-6 space-y-5">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.05]">
                Munshi Premchand Gramin Pustakalay - MPGPT
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Designed for day-to-day library work, this platform supports student access,
                member records, bookings, and credits without adding noise to the experience.
              </p>
              <p className="max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Digital enabled library, so that students focus on their studies and admins
                on improving it.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-full bg-slate-900 px-6 text-sm text-white hover:bg-slate-800">
                <Link href="/auth">
                  Open portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-slate-300 bg-white px-6 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <dl className="mt-10 grid gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Location</dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">Sarawan, Sarwan 814150</dd>
                <dd className="mt-2 text-sm font-medium text-slate-900">+ multiple other branches</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Library mode</dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">Offline library operations</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Device</dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">Responsive on desktop and mobile</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f5f1e8_100%)] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Library overview</p>
                  <p className="mt-1 text-sm text-slate-500">A simpler public front for a rural library system</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  Sarwan
                </div>
              </div>

              <SummaryPanel />

            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-slate-200 py-8 sm:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">How it works</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Clear steps for students and admins.
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              The system is designed around everyday workflows already used by the library, from credit recharge
              requests to booking management and profile updates.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Library className="size-5" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-950">For students</h4>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {studentSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="size-5" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-950">For admins</h4>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {adminSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <aside className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fffefb_0%,#f3efe5_100%)] p-5 shadow-sm sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <Smartphone className="size-5" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-950">On mobile</h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Students can check credits, bookings, and profile details from their phones. Admins can review
                requests and update records without needing a desktop-first layout.
              </p>
              <div className="mt-6 rounded-2xl bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Core actions</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>Credit requests</li>
                  <li>Booking management</li>
                  <li>Library listing access</li>
                  <li>Profile updates</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for Munshi Premchand Gramin Pustakalay, Sarwan.</p>
          <Link href="/auth" className="font-medium text-slate-900 underline-offset-4 hover:underline">
            Continue to login
          </Link>
        </footer>

        <CheatCodeListener />
      </main>
    </div>
  );
}
