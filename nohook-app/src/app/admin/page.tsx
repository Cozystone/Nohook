import Link from "next/link";
import { cities } from "@/lib/data";

const allSegments = cities.flatMap((city) =>
  city.segments.map((segment) => ({
    city: city.shortLabel,
    ...segment,
  })),
);

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e8] px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[2rem] border border-stone-900/10 bg-white p-6 shadow-[0_18px_60px_rgba(74,57,34,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                Operator review preview
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
                Incident moderation queue
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700">
                This screen models the back-office workflow for approving or
                rejecting traveler reports before they affect public segment
                colors.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex rounded-full border border-stone-900/12 px-4 py-2 text-sm text-stone-800 transition hover:bg-stone-950 hover:text-white"
            >
              Back to traveler map
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Pending review" value="7" />
          <SummaryCard label="Approved today" value="11" />
          <SummaryCard label="Rejected duplicates" value="5" />
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-900/10 bg-white shadow-[0_18px_60px_rgba(74,57,34,0.08)]">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.9fr] border-b border-stone-900/10 bg-[#f8f3ea] px-6 py-4 text-xs uppercase tracking-[0.18em] text-stone-500">
            <span>Segment</span>
            <span>City</span>
            <span>Risk</span>
            <span>Recent reports</span>
          </div>
          <div className="divide-y divide-stone-900/8">
            {allSegments.map((segment) => (
              <div
                key={segment.id}
                className="grid grid-cols-1 gap-3 px-6 py-5 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.9fr]"
              >
                <div>
                  <p className="text-base font-semibold tracking-[-0.03em]">
                    {segment.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {segment.summary}
                  </p>
                </div>
                <p className="text-sm text-stone-700">{segment.city}</p>
                <p className="text-sm text-stone-700">{segment.riskLevel}</p>
                <p className="text-sm font-mono text-stone-700">
                  {segment.recentReportCount}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.6rem] border border-stone-900/10 bg-[#103534] p-5 text-white shadow-[0_18px_50px_rgba(16,53,52,0.22)]">
      <p className="text-xs uppercase tracking-[0.2em] text-[#d4ebe5]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{value}</p>
    </article>
  );
}
