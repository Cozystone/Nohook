"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import {
  categoryLabelMap,
  riskLabelMap,
  riskPalette,
  timeBucketLabelMap,
  travelerTypeLabelMap,
} from "@/lib/data";
import { GoogleRiskMap } from "@/components/google-risk-map";
import type {
  CityData,
  ReportPayload,
  ReportSubmissionResult,
  RiskLevel,
  RoadSegment,
} from "@/lib/types";

const riskCopy: Record<RiskLevel, string> = {
  Green: "상대적으로 안정적",
  Yellow: "주의해서 이동",
  Orange: "반복 신호 감지",
  Red: "가능하면 우회 권장",
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
      message: "현장 신고를 전송하고 있습니다...",
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
        message:
          "신고 전송에 실패했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1318] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-3 py-3 sm:px-4 lg:px-5">
        <div className="relative flex min-h-[calc(100vh-24px)] flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-[#10161d] shadow-[0_28px_100px_rgba(0,0,0,0.42)]">
          <GoogleRiskMap
            city={activeCity}
            selectedSegmentId={selectedSegment.id}
            onSelectSegment={setSelectedSegmentId}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(9,13,18,0.92)_0%,rgba(9,13,18,0.52)_52%,rgba(9,13,18,0)_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[linear-gradient(270deg,rgba(9,13,18,0.86)_0%,rgba(9,13,18,0)_100%)]" />

          <header className="pointer-events-auto absolute left-4 right-4 top-4 z-20 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl rounded-[1.6rem] border border-white/12 bg-black/35 px-4 py-4 backdrop-blur-md sm:px-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
                <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1">
                  Nohook beta
                </span>
                <span>베트남 거리 위험 지도</span>
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                위성 지도 위에서
                <br />
                위험 도로를 바로 확인합니다.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                호객행위, 가짜 택시, 시클로 과다요금, 사진 유도 후 팁 강요
                같은 신호를 실제 지도앱처럼 중심 화면에서 먼저 보여줍니다.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Pill label="호치민 1군 · 하노이 올드쿼터" tone="dark" />
                <Pill label="리뷰 신호 + 여행자 신고 + 운영 검수" tone="outline" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:w-[340px]">
              <StatCard
                label="모니터링"
                value={totals.monitoredRoads.toString()}
                tone="neutral"
              />
              <StatCard
                label="고위험"
                value={totals.redCount.toString()}
                tone="red"
              />
              <StatCard
                label="최근 신고"
                value={totals.totalReports.toString()}
                tone="teal"
              />
            </div>
          </header>

          <div className="pointer-events-auto absolute left-4 top-[17.5rem] z-20 flex flex-wrap gap-2 sm:top-[16.25rem]">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  setActiveCityId(city.id);
                  setSelectedSegmentId(city.segments[0]?.id ?? "");
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition ${
                  city.id === activeCity.id
                    ? "bg-white text-stone-950"
                    : "border border-white/15 bg-black/35 text-white/82 hover:bg-black/55"
                }`}
              >
                {city.shortLabel}
              </button>
            ))}
          </div>

          <aside className="pointer-events-auto absolute bottom-4 left-4 z-20 w-[min(100%,28rem)] rounded-[1.8rem] border border-white/12 bg-[rgba(7,11,16,0.78)] p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/54">
                  선택된 도로
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {selectedSegment.name}
                </h2>
                <p className="mt-1 text-sm text-white/62">{activeCity.label}</p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: riskPalette[selectedSegment.riskLevel] }}
              >
                {riskLabelMap[selectedSegment.riskLevel]}
              </span>
            </div>

            <p className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/6 p-4 text-sm leading-6 text-white/82">
              {selectedSegment.summary}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricBox
                label="여행자 신고"
                value={selectedSegment.recentReportCount.toString()}
              />
              <MetricBox
                label="이동 권고"
                value={riskCopy[selectedSegment.riskLevel]}
              />
              <MetricBox
                label="주요 유형"
                value={
                  categoryLabelMap[selectedSegment.topCategories[0]] ??
                  selectedSegment.topCategories[0]
                }
              />
              <MetricBox
                label="주변 신호"
                value={selectedSegment.placeSignals.length.toString()}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSegment.topCategories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-white/10 bg-white/7 px-3 py-2 text-xs text-white/82"
                >
                  {categoryLabelMap[category] ?? category}
                </span>
              ))}
            </div>
          </aside>

          <aside className="pointer-events-auto absolute bottom-4 right-4 z-20 hidden w-[25rem] rounded-[1.8rem] border border-white/12 bg-[rgba(7,11,16,0.78)] p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl xl:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/54">
                  Quick report
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                  현장 신고 보내기
                </h2>
              </div>
              <Link
                href="/admin"
                className="rounded-full border border-white/14 bg-white/8 px-3 py-2 text-xs text-white/76 transition hover:bg-white/14"
              >
                운영 화면
              </Link>
            </div>

            <ReportPanel
              city={activeCity}
              selectedSegment={selectedSegment}
              reportState={reportState}
              onSubmit={handleSubmit}
              compact
            />
          </aside>
        </div>

        <section className="mt-4 grid gap-4 xl:hidden">
          <ReportPanel
            city={activeCity}
            selectedSegment={selectedSegment}
            reportState={reportState}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  );
}

function Pill({ label, tone }: { label: string; tone: "dark" | "outline" }) {
  return (
    <span
      className={`rounded-full px-3 py-2 ${
        tone === "dark"
          ? "bg-white/14 text-white"
          : "border border-white/14 bg-transparent text-white/76"
      }`}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "red" | "teal";
}) {
  const toneClasses = {
    neutral: "bg-[rgba(255,255,255,0.13)] text-white",
    red: "bg-[rgba(207,63,47,0.88)] text-white",
    teal: "bg-[rgba(16,53,52,0.9)] text-white",
  };

  return (
    <div
      className={`rounded-[1.3rem] border border-white/10 px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)] backdrop-blur-md ${toneClasses[tone]}`}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/72">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
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
  compact = false,
}: {
  city: CityData;
  selectedSegment: RoadSegment;
  reportState: {
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  };
  onSubmit: (formData: FormData) => Promise<void>;
  compact?: boolean;
}) {
  return (
    <section
      className={
        compact
          ? "mt-4"
          : "rounded-[2rem] border border-white/10 bg-[rgba(7,11,16,0.78)] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
      }
    >
      {!compact ? (
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/52">
            Quick report
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            30초 안에 현장 신고 보내기
          </h2>
          <p className="text-sm leading-6 text-white/70">
            신고는 공개 전에 운영 검수를 거칩니다. 기본 모드는 익명입니다.
          </p>
        </div>
      ) : null}

      <form action={onSubmit} className={`${compact ? "space-y-3" : "mt-5 space-y-4"}`}>
        <input type="hidden" name="segmentId" value={selectedSegment.id} />
        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-white/50">
            선택된 도로
          </p>
          <p className="mt-2 text-base font-semibold text-white">
            {selectedSegment.name}
          </p>
          <p className="mt-1 text-sm text-white/62">{city.label}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/82">신고 유형</span>
          <select
            name="category"
            className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
            defaultValue={selectedSegment.topCategories[0]}
          >
            {Object.entries(categoryLabelMap).map(([category, label]) => (
              <option key={category} value={category} className="text-stone-950">
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/82">발생 시간대</span>
            <select
              name="incidentTimeBucket"
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
              defaultValue="Evening"
            >
              {Object.entries(timeBucketLabelMap).map(([value, label]) => (
                <option key={value} value={value} className="text-stone-950">
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/82">여행 형태</span>
            <select
              name="travelerType"
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
              defaultValue="Solo traveler"
            >
              {Object.entries(travelerTypeLabelMap).map(([value, label]) => (
                <option key={value} value={value} className="text-stone-950">
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/82">
            무슨 일이 있었나요
          </span>
          <textarea
            name="note"
            rows={compact ? 3 : 4}
            placeholder="예: 시클로 기사가 10만동이라고 했는데 도착 후 50만동을 요구했습니다."
            className="w-full rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/36 focus:border-white/40"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={reportState.status === "submitting"}
        >
          {reportState.status === "submitting" ? "전송 중..." : "익명 신고 제출"}
        </button>

        {reportState.status !== "idle" ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              reportState.status === "success"
                ? "bg-[#163d35] text-[#d4f1e6]"
                : reportState.status === "error"
                  ? "bg-[#4c1f1a] text-[#ffd6cf]"
                  : "bg-white/10 text-white/72"
            }`}
          >
            {reportState.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
