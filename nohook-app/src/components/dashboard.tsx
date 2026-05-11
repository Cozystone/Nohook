"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import type {
  CityData,
  ReportPayload,
  ReportSubmissionResult,
  RiskLevel,
  RoadSegment,
} from "@/lib/types";

const riskPalette: Record<RiskLevel, string> = {
  Green: "#1f9d77",
  Yellow: "#f0b23c",
  Orange: "#f06a3a",
  Red: "#cf3f2f",
};

const riskCopy: Record<RiskLevel, string> = {
  Green: "Low friction",
  Yellow: "Stay alert",
  Orange: "Repeated signals",
  Red: "Avoid if possible",
};

type DashboardProps = {
  cities: CityData[];
};

const initialReportState = {
  status: "idle" as "idle" | "submitting" | "success" | "error",
  message: "",
};

export function Dashboard({ cities }: DashboardProps) {
  const [activeCityId, setActiveCityId] = useState(cities[0]?.id ?? "");
  const [selectedSegmentId, setSelectedSegmentId] = useState(
    cities[0]?.segments[0]?.id ?? "",
  );
  const [reportState, setReportState] = useState(initialReportState);

  const activeCity = useMemo(
    () => cities.find((city) => city.id === activeCityId) ?? cities[0],
    [activeCityId, cities],
  );

  const selectedSegment = useMemo(
    () =>
      activeCity.segments.find((segment) => segment.id === selectedSegmentId) ??
      activeCity.segments[0],
    [activeCity, selectedSegmentId],
  );

  const totals = useMemo(() => {
    const allSegments = cities.flatMap((city) => city.segments);

    return {
      redCount: allSegments.filter((segment) => segment.riskLevel === "Red")
        .length,
      totalReports: allSegments.reduce(
        (sum, segment) => sum + segment.recentReportCount,
        0,
      ),
      monitoredRoads: allSegments.length,
    };
  }, [cities]);

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    const requestBody: ReportPayload = {
      cityId: activeCity.id,
      segmentId: payload.segmentId,
      category: payload.category,
      incidentTimeBucket: payload.incidentTimeBucket,
      note: payload.note,
      travelerType: payload.travelerType,
    };

    setReportState({
      status: "submitting",
      message: "Submitting live incident signal...",
    });

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Unable to submit report");
      }

      const result = (await response.json()) as ReportSubmissionResult;

      startTransition(() => {
        setReportState({
          status: "success",
          message: result.message,
        });
      });
    } catch {
      setReportState({
        status: "error",
        message: "Submission failed. Please retry when your connection is stable.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7e7c7_0,#f5f0e4_34%,#f4f1eb_62%,#ebe9df_100%)] text-stone-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-stone-900/10 bg-[#f8f5ef]/90 p-4 shadow-[0_18px_60px_rgba(69,50,25,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-stone-600">
                <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1">
                  Nohook beta
                </span>
                <span>Vietnam street risk map</span>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-6xl">
                  Read the street before the street reads you.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
                  Nohook surfaces aggressive touting, fake taxi pressure,
                  cyclo overcharge, and forced-photo tip hotspots as colored
                  road segments for first-time travelers in Vietnam.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-full bg-stone-950 px-4 py-2 text-stone-50">
                  District-level MVP for Ho Chi Minh City and Hanoi
                </div>
                <div className="rounded-full border border-stone-900/15 px-4 py-2 text-stone-700">
                  Review signals + traveler reports + operator moderation
                </div>
              </div>
            </div>

            <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[24rem] lg:max-w-md">
              <StatCard
                label="Monitored roads"
                value={totals.monitoredRoads.toString()}
                tone="sand"
              />
              <StatCard
                label="High-risk roads"
                value={totals.redCount.toString()}
                tone="red"
              />
              <StatCard
                label="Recent reports"
                value={totals.totalReports.toString()}
                tone="teal"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-4 shadow-[0_22px_70px_rgba(73,53,28,0.08)] sm:p-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                    Risk map
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                    Street-level risk overlay
                  </h2>
                </div>

                <div className="inline-flex rounded-full border border-stone-900/10 bg-stone-100 p-1">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setActiveCityId(city.id);
                        setSelectedSegmentId(city.segments[0]?.id ?? "");
                      }}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        city.id === activeCity.id
                          ? "bg-stone-950 text-white"
                          : "text-stone-600 hover:text-stone-950"
                      }`}
                    >
                      {city.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <MapPanel
                  city={activeCity}
                  selectedSegmentId={selectedSegment.id}
                  onSelectSegment={setSelectedSegmentId}
                />
                <SegmentPanel segment={selectedSegment} cityLabel={activeCity.label} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <SignalCard
                title="How Nohook scores a road"
                body="Each street segment blends recent review evidence, repeat category patterns, approved traveler reports, and a distance cap so one venue cannot dominate a district."
              />
              <SignalCard
                title="Designed for first-time visitors"
                body="The UI prioritizes color, short explanations, and immediate actions over dense map controls or lengthy review reading."
              />
              <SignalCard
                title="Built for moderation"
                body="Reports are stored as signals, not verdicts. Operators approve, reject, or hold submissions before they affect visible risk."
              />
            </div>
          </div>

          <div className="space-y-6">
            <ReportPanel
              city={activeCity}
              selectedSegment={selectedSegment}
              reportState={reportState}
              onSubmit={handleSubmit}
            />

            <aside className="rounded-[2rem] border border-stone-900/10 bg-[#103534] p-6 text-stone-50 shadow-[0_20px_70px_rgba(13,54,53,0.28)]">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.18em] text-[#c6ece3]">
                  Operations snapshot
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  Moderator queue is part of the MVP.
                </h2>
                <p className="text-sm leading-6 text-[#d6ede7]">
                  Operator tools stay separate from the public traveler view,
                  but the workflow is already modeled in this prototype.
                </p>
              </div>
              <div className="mt-6 space-y-3">
                <QueueRow label="Received today" value="18" />
                <QueueRow label="Auto-clustered duplicates" value="5" />
                <QueueRow label="Pending review" value="7" />
              </div>
              <Link
                href="/admin"
                className="mt-6 inline-flex rounded-full bg-[#f5d27f] px-4 py-2 text-sm font-medium text-stone-950 transition hover:bg-[#f7dfa4]"
              >
                Open admin review preview
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sand" | "red" | "teal";
}) {
  const toneClasses = {
    sand: "bg-[#f5ebd8] text-stone-950",
    red: "bg-[#cf3f2f] text-stone-50",
    teal: "bg-[#103534] text-stone-50",
  };

  return (
    <div className={`rounded-[1.5rem] p-4 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.2em] opacity-80">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function SignalCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[1.75rem] border border-stone-900/10 bg-white/80 p-5 shadow-[0_12px_40px_rgba(82,62,35,0.06)]">
      <h3 className="text-lg font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-700">{body}</p>
    </article>
  );
}

function QueueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <span className="text-sm text-[#d6ede7]">{label}</span>
      <span className="font-mono text-base">{value}</span>
    </div>
  );
}

function MapPanel({
  city,
  selectedSegmentId,
  onSelectSegment,
}: {
  city: CityData;
  selectedSegmentId: string;
  onSelectSegment: (id: string) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-stone-900/10 bg-[#f4efe4] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
            {city.label}
          </p>
          <p className="text-sm text-stone-600">{city.subtitle}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {(["Green", "Yellow", "Orange", "Red"] as RiskLevel[]).map((level) => (
            <span
              key={level}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-stone-700"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: riskPalette[level] }}
              />
              {level}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-stone-900/10 bg-[linear-gradient(180deg,#ebe2cf_0%,#f8f4ed_100%)]">
        <svg
          viewBox="0 0 620 420"
          className="h-auto w-full"
          role="img"
          aria-label={`${city.label} street risk map`}
        >
          <defs>
            <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path
                d="M 36 0 L 0 0 0 36"
                fill="none"
                stroke="#ddd4c2"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="620" height="420" fill="url(#grid)" />
          {city.landmarks.map((landmark) => (
            <g key={landmark.label}>
              <circle cx={landmark.x} cy={landmark.y} r="6" fill="#103534" />
              <text
                x={landmark.x + 12}
                y={landmark.y + 5}
                fill="#27403d"
                fontSize="13"
                fontFamily="var(--font-mono)"
              >
                {landmark.label}
              </text>
            </g>
          ))}
          {city.segments.map((segment) => {
            const isSelected = segment.id === selectedSegmentId;

            return (
              <g key={segment.id}>
                <path
                  d={segment.mapPath}
                  fill="none"
                  stroke={riskPalette[segment.riskLevel]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isSelected ? 24 : 18}
                  opacity={isSelected ? 0.92 : 0.76}
                  className="cursor-pointer transition"
                  onClick={() => onSelectSegment(segment.id)}
                />
                <path
                  d={segment.mapPath}
                  fill="none"
                  stroke={isSelected ? "#171717" : "rgba(23,23,23,0.15)"}
                  strokeDasharray={isSelected ? "1 0" : "8 10"}
                  strokeLinecap="round"
                  strokeWidth={isSelected ? 2 : 1.4}
                  pointerEvents="none"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-3">
        {city.segments.map((segment) => {
          const isSelected = segment.id === selectedSegmentId;

          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => onSelectSegment(segment.id)}
              className={`flex items-start justify-between gap-4 rounded-[1.35rem] border p-4 text-left transition ${
                isSelected
                  ? "border-stone-950 bg-white shadow-[0_10px_30px_rgba(74,57,35,0.08)]"
                  : "border-stone-900/10 bg-white/70 hover:bg-white"
              }`}
            >
              <div>
                <p className="text-base font-semibold tracking-[-0.03em]">
                  {segment.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {segment.summary}
                </p>
              </div>
              <div className="min-w-fit text-right">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: riskPalette[segment.riskLevel] }}
                >
                  {segment.riskLevel}
                </span>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-stone-500">
                  Score {segment.riskScore}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SegmentPanel({
  segment,
  cityLabel,
}: {
  segment: RoadSegment;
  cityLabel: string;
}) {
  return (
    <section className="rounded-[1.75rem] bg-stone-950 p-5 text-stone-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {cityLabel}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            {segment.name}
          </h3>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: riskPalette[segment.riskLevel] }}
        >
          {segment.riskLevel}
        </span>
      </div>

      <p className="mt-4 rounded-[1.35rem] border border-white/8 bg-white/5 p-4 text-sm leading-6 text-stone-200">
        {segment.summary}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricBox
          label="Traveler reports"
          value={segment.recentReportCount.toString()}
        />
        <MetricBox label="Nearby signals" value={segment.placeSignals.length.toString()} />
        <MetricBox label="Primary category" value={segment.topCategories[0]} />
        <MetricBox label="Risk stance" value={riskCopy[segment.riskLevel]} />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Top categories
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {segment.topCategories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-stone-200"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Why this road is flagged
          </p>
          <ul className="mt-3 space-y-3">
            {segment.reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-3 text-sm leading-6 text-stone-200"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Nearby place signals
          </p>
          <div className="mt-3 space-y-3">
            {segment.placeSignals.map((signal) => (
              <div
                key={signal.placeName}
                className="rounded-[1.15rem] border border-white/8 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-100">{signal.placeName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-stone-400">
                      {signal.signalType}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-[#f5d27f]">
                    +{signal.signalScore}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-200">
                  {signal.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">{label}</p>
      <p className="mt-2 text-lg font-medium text-stone-100">{value}</p>
    </div>
  );
}

function ReportPanel({
  city,
  selectedSegment,
  reportState,
  onSubmit,
}: {
  city: CityData;
  selectedSegment: RoadSegment;
  reportState: {
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  };
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <section className="rounded-[2rem] border border-stone-900/10 bg-white/92 p-6 shadow-[0_20px_60px_rgba(75,57,31,0.08)]">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Quick report
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">
          Send a live street signal in under 30 seconds.
        </h2>
        <p className="text-sm leading-6 text-stone-700">
          Reports are moderated before they affect public risk color. Default
          mode is anonymous.
        </p>
      </div>

      <form action={onSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="segmentId" value={selectedSegment.id} />
        <div className="rounded-[1.4rem] border border-stone-900/10 bg-[#f7f3ec] p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-stone-500">
            Auto-selected road
          </p>
          <p className="mt-2 text-base font-semibold text-stone-950">
            {selectedSegment.name}
          </p>
          <p className="mt-1 text-sm text-stone-600">{city.label}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-800">Category</span>
          <select
            name="category"
            className="w-full rounded-2xl border border-stone-900/12 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
            defaultValue={selectedSegment.topCategories[0]}
          >
            {[
              "Taxi scam",
              "Cyclo overcharge",
              "Aggressive touting",
              "Forced tip / photo pressure",
              "Fake goods push",
              "Verbal harassment",
              "Sexual harassment",
              "Other",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">
              Time bucket
            </span>
            <select
              name="incidentTimeBucket"
              className="w-full rounded-2xl border border-stone-900/12 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
              defaultValue="Evening"
            >
              {["Morning", "Afternoon", "Evening", "Late night"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">
              Traveler type
            </span>
            <select
              name="travelerType"
              className="w-full rounded-2xl border border-stone-900/12 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
              defaultValue="Solo traveler"
            >
              {[
                "Solo traveler",
                "Pair",
                "Family",
                "Group",
                "Digital nomad",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-800">
            What happened
          </span>
          <textarea
            name="note"
            rows={4}
            placeholder="Example: Cyclo driver said 100k, demanded 500k at drop-off."
            className="w-full rounded-[1.4rem] border border-stone-900/12 bg-white px-4 py-3 text-sm leading-6 text-stone-900 outline-none transition focus:border-stone-950"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={reportState.status === "submitting"}
        >
          {reportState.status === "submitting"
            ? "Submitting..."
            : "Submit anonymous report"}
        </button>

        {reportState.status !== "idle" ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              reportState.status === "success"
                ? "bg-[#e3f3ee] text-[#0e4b3f]"
                : reportState.status === "error"
                  ? "bg-[#fde8e5] text-[#952b1f]"
                  : "bg-[#f5f0e5] text-stone-700"
            }`}
          >
            {reportState.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
