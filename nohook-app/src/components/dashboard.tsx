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
  Green: "비교적 안정",
  Yellow: "경계 유지",
  Orange: "반복 신고 감지",
  Red: "우회 권장",
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
      highRiskCount: allSegments.filter((segment) => segment.riskLevel === "Red")
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
      message: "현장 신고를 전송하는 중입니다...",
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
        message: "신고 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <GoogleRiskMap
          city={activeCity}
          selectedSegmentId={selectedSegment.id}
          onSelectSegment={setSelectedSegmentId}
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,12,0.82)_0%,rgba(4,8,12,0.28)_22%,rgba(4,8,12,0.04)_48%,rgba(4,8,12,0.72)_100%)]" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-4">
          <div className="pointer-events-auto flex w-full max-w-[1440px] items-start justify-between gap-3">
            <TopSummary
              activeCity={activeCity}
              cities={cities}
              activeCityId={activeCityId}
              onChangeCity={(cityId) => {
                const nextCity = cities.find((city) => city.id === cityId);
                setActiveCityId(cityId);
                setSelectedSegmentId(nextCity?.segments[0]?.id ?? "");
              }}
            />

            <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/82 shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:flex">
              <CompactStat label="모니터링" value={totals.monitoredRoads.toString()} />
              <CompactStat label="고위험" value={totals.highRiskCount.toString()} />
              <CompactStat label="최근 신고" value={totals.totalReports.toString()} />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-0 pb-0 md:px-4 md:pb-4">
          <div className="pointer-events-auto flex w-full max-w-[1440px] flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="mx-0 w-full rounded-t-[2rem] border border-white/10 bg-[rgba(7,12,18,0.82)] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl md:mx-0 md:max-w-[28rem] md:rounded-[2rem] md:p-5">
              <SegmentCard segment={selectedSegment} city={activeCity} />
            </div>

            <div className="hidden w-full max-w-[24rem] rounded-[2rem] border border-white/10 bg-[rgba(7,12,18,0.82)] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:block">
              <ReportPanel
                city={activeCity}
                selectedSegment={selectedSegment}
                reportState={reportState}
                onSubmit={handleSubmit}
                compact
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 lg:hidden">
        <div className="rounded-[2rem] border border-white/10 bg-[#0b141d] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
          <ReportPanel
            city={activeCity}
            selectedSegment={selectedSegment}
            reportState={reportState}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </main>
  );
}

function TopSummary({
  activeCity,
  cities,
  activeCityId,
  onChangeCity,
}: {
  activeCity: CityData;
  cities: CityData[];
  activeCityId: string;
  onChangeCity: (cityId: string) => void;
}) {
  return (
    <div className="w-full max-w-[42rem] rounded-[2rem] border border-white/10 bg-black/42 px-4 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:px-5">
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/70">
        <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">
          Nohook beta
        </span>
        <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1">
          베트남 관광 안전 지도
        </span>
      </div>

      <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
        실제 지도 위에서
        <br />
        위험 도로만 먼저 보이게
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/76 sm:text-base">
        호객, 시클로 과다요금, 사진 유도 후 팁 강요, 가짜 택시 신호를 도로
        단위로 요약해 보여줍니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => onChangeCity(city.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              city.id === activeCityId
                ? "bg-white text-stone-950"
                : "border border-white/12 bg-white/6 text-white/80 hover:bg-white/12"
            }`}
          >
            {city.shortLabel}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/72">
        <LegendBadge color={riskPalette.Red} label="고위험" />
        <LegendBadge color={riskPalette.Orange} label="반복 신고" />
        <LegendBadge color={riskPalette.Yellow} label="주의" />
      </div>

      <p className="mt-4 text-sm text-white/60">{activeCity.subtitle}</p>
    </div>
  );
}

function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[84px]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/54">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

function SegmentCard({
  segment,
  city,
}: {
  segment: RoadSegment;
  city: CityData;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/52">
            선택된 도로
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            {segment.name}
          </h2>
          <p className="mt-1 text-sm text-white/60">{city.label}</p>
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: riskPalette[segment.riskLevel] }}
        >
          {riskLabelMap[segment.riskLevel]}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/78">{segment.summary}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoMetric label="위험 점수" value={segment.riskScore.toString()} />
        <InfoMetric label="판단" value={riskCopy[segment.riskLevel]} />
        <InfoMetric
          label="최근 신고"
          value={`${segment.recentReportCount}건`}
        />
        <InfoMetric
          label="주요 유형"
          value={categoryLabelMap[segment.topCategories[0]]}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {segment.topCategories.map((category) => (
          <span
            key={category}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/78"
          >
            {categoryLabelMap[category] ?? category}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {segment.placeSignals.map((signal) => (
          <div
            key={signal.placeName}
            className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{signal.placeName}</p>
              <span className="text-xs text-white/54">
                신호 {signal.signalScore}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/62">{signal.signalType}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/48">{label}</p>
      <p className="mt-2 text-lg font-medium text-white">{value}</p>
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
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/52">
            Quick report
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            현장 신고 보내기
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/68">
            신고는 운영 검수 후 지도 위험도에 반영됩니다.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs text-white/76 transition hover:bg-white/12"
        >
          운영 화면
        </Link>
      </div>

      <form action={onSubmit} className={`space-y-4 ${compact ? "mt-4" : "mt-5"}`}>
        <input type="hidden" name="segmentId" value={selectedSegment.id} />

        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-white/48">
            선택 구간
          </p>
          <p className="mt-2 text-base font-semibold text-white">
            {selectedSegment.name}
          </p>
          <p className="mt-1 text-sm text-white/60">{city.label}</p>
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
          <span className="text-sm font-medium text-white/82">상황 메모</span>
          <textarea
            name="note"
            rows={compact ? 4 : 5}
            placeholder="예: 시클로 기사가 처음에는 10만동이라고 했지만 도착 후 50만동을 요구했습니다."
            className="w-full rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/34 focus:border-white/40"
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
