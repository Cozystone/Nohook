"use client";

import Link from "next/link";
import { startTransition, useMemo, useRef, useState } from "react";
import {
  categoryLabelMap,
  riskLabelMap,
  riskPalette,
  timeBucketLabelMap,
  travelerTypeLabelMap,
} from "@/lib/data";
import {
  GoogleRiskMap,
  type RiskMapHandle,
} from "@/components/google-risk-map";
import type {
  CityData,
  ReportPayload,
  ReportSubmissionResult,
  RiskLevel,
  RoadSegment,
} from "@/lib/types";

const riskCopy: Record<RiskLevel, string> = {
  Green: "비교적 안정",
  Yellow: "경계 필요",
  Orange: "반복 신고 감지",
  Red: "우회 권장",
};

type DashboardProps = {
  cities: CityData[];
};

type AppTab = "insight" | "report";

const initialReportState = {
  status: "idle" as "idle" | "submitting" | "success" | "error",
  message: "",
};

export function Dashboard({ cities }: DashboardProps) {
  const [activeCityId, setActiveCityId] = useState(cities[0]?.id ?? "");
  const [selectedSegmentId, setSelectedSegmentId] = useState(
    cities[0]?.segments[0]?.id ?? "",
  );
  const [activeTab, setActiveTab] = useState<AppTab>("insight");
  const [reportState, setReportState] = useState(initialReportState);
  const mapRef = useRef<RiskMapHandle | null>(null);

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
      monitoredRoads: allSegments.length,
      highRiskCount: allSegments.filter((segment) => segment.riskLevel === "Red")
        .length,
      totalReports: allSegments.reduce(
        (sum, segment) => sum + segment.recentReportCount,
        0,
      ),
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
        setActiveTab("report");
      });
    } catch {
      setReportState({
        status: "error",
        message: "신고 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071019] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(71,88,135,0.2),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(24,123,109,0.16),transparent_18%),linear-gradient(180deg,#05080c_0%,#09111b_52%,#05070a_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:90px_90px]" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col items-center justify-center gap-8 px-4 py-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="w-full max-w-[420px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/68">
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">
                Nohook beta
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1">
                베트남 거리 위험 지도
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white">
              아이폰 앱처럼
              <br />
              위험 도로를 먼저 보여줍니다
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/74">
              호객, 시클로 과다요금, 사진 유도 후 팁 강요를 도로 단위로 먼저
              확인하고 바로 신고까지 이어지는 시연 화면입니다.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <HeroStat label="모니터링" value={totals.monitoredRoads.toString()} />
              <HeroStat label="고위험" value={totals.highRiskCount.toString()} />
              <HeroStat label="최근 신고" value={totals.totalReports.toString()} />
            </div>
          </div>
        </div>

        <IPhoneMockup>
          <div className="relative flex h-full flex-col overflow-hidden bg-[#070d14] text-white">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(5,9,13,0.38)_0%,rgba(5,9,13,0.04)_28%,rgba(5,9,13,0)_48%,rgba(5,9,13,0.62)_100%)]" />

            <div className="relative z-20 flex items-center justify-between px-6 pb-3 pt-5 text-[13px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-white/72">
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
              </div>
            </div>

            <div className="relative z-20 px-5">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/38 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                      Nohook
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                      오늘 걸을 거리
                    </h2>
                  </div>
                  <Link
                    href="/admin"
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs text-white/76"
                  >
                    운영
                  </Link>
                </div>
                <p className="mt-2 text-sm text-white/66">{activeCity.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setActiveCityId(city.id);
                        setSelectedSegmentId(city.segments[0]?.id ?? "");
                      }}
                      className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                        city.id === activeCityId
                          ? "bg-white text-stone-950"
                          : "border border-white/12 bg-white/6 text-white/78"
                      }`}
                    >
                      {city.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-0 mt-4 flex-1 px-4 pb-4">
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#091018] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <GoogleRiskMap
                  ref={mapRef}
                  city={activeCity}
                  selectedSegmentId={selectedSegment.id}
                  onSelectSegment={setSelectedSegmentId}
                />

                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-[linear-gradient(180deg,rgba(5,9,13,0.72)_0%,rgba(5,9,13,0.14)_60%,rgba(5,9,13,0)_100%)]" />

                <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 pt-4">
                  <div className="max-w-[65%] rounded-[1.35rem] border border-white/10 bg-black/46 px-4 py-3 backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/46">
                      선택된 도로
                    </p>
                    <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                      {selectedSegment.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/64">
                      {riskCopy[selectedSegment.riskLevel]}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <MapButton label="+" onClick={() => mapRef.current?.zoomIn()} />
                    <MapButton label="-" onClick={() => mapRef.current?.zoomOut()} />
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-30 p-3">
                  <div className="rounded-[1.8rem] border border-white/10 bg-[rgba(7,12,18,0.86)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">
                          {activeCity.label}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                          {selectedSegment.name}
                        </h3>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{
                          backgroundColor:
                            riskPalette[selectedSegment.riskLevel],
                        }}
                      >
                        {riskLabelMap[selectedSegment.riskLevel]}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2 rounded-full bg-white/6 p-1">
                      <TabButton
                        active={activeTab === "insight"}
                        label="위험 정보"
                        onClick={() => setActiveTab("insight")}
                      />
                      <TabButton
                        active={activeTab === "report"}
                        label="신고하기"
                        onClick={() => setActiveTab("report")}
                      />
                    </div>

                    {activeTab === "insight" ? (
                      <InsightPanel
                        city={activeCity}
                        segment={selectedSegment}
                      />
                    ) : (
                      <ReportPanel
                        city={activeCity}
                        selectedSegment={selectedSegment}
                        reportState={reportState}
                        onSubmit={handleSubmit}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </IPhoneMockup>
      </section>
    </main>
  );
}

function IPhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[460px] lg:max-w-[480px]">
      <div className="pointer-events-none absolute -inset-10 rounded-[4rem] bg-[radial-gradient(circle_at_50%_18%,rgba(60,115,255,0.18),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(30,193,163,0.16),transparent_20%)] blur-3xl" />
      <div className="relative rounded-[3.6rem] border border-white/10 bg-[#c8ccd6] p-[10px] shadow-[0_40px_120px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute left-1/2 top-[16px] z-30 h-8 w-36 -translate-x-1/2 rounded-full bg-[#0a0f16]" />
        <div className="relative overflow-hidden rounded-[3rem] bg-[#070d14] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
          <div className="aspect-[430/900] min-h-[720px] w-full sm:min-h-[760px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/6 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

function MapButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/46 text-lg font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl"
    >
      {label}
    </button>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-white text-stone-950"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function InsightPanel({
  city,
  segment,
}: {
  city: CityData;
  segment: RoadSegment;
}) {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm leading-6 text-white/74">{segment.summary}</p>

      <div className="grid grid-cols-2 gap-3">
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

      <div className="flex flex-wrap gap-2">
        {segment.topCategories.map((category) => (
          <span
            key={category}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/78"
          >
            {categoryLabelMap[category] ?? category}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {segment.placeSignals.map((signal) => (
          <div
            key={signal.placeName}
            className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {signal.placeName}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {signal.signalType}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72">
                신호 {signal.signalScore}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {signal.evidence}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/68">
        현재 도시: {city.label}
      </div>
    </div>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/48">{label}</p>
      <p className="mt-2 text-base font-medium text-white">{value}</p>
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
    <section className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">
            Quick report
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
            현장 신고 보내기
          </h3>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs text-white/76"
        >
          운영 화면
        </Link>
      </div>

      <form action={onSubmit} className="mt-4 space-y-4">
        <input type="hidden" name="segmentId" value={selectedSegment.id} />

        <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/46">
            선택 구간
          </p>
          <p className="mt-2 text-base font-semibold">{selectedSegment.name}</p>
          <p className="mt-1 text-sm text-white/60">{city.label}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/82">신고 유형</span>
          <select
            name="category"
            defaultValue={selectedSegment.topCategories[0]}
            className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-white/36"
          >
            {Object.entries(categoryLabelMap).map(([category, label]) => (
              <option key={category} value={category} className="text-stone-950">
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/82">발생 시간대</span>
            <select
              name="incidentTimeBucket"
              defaultValue="Evening"
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-white/36"
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
              defaultValue="Solo traveler"
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-white/36"
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
            rows={4}
            placeholder="예: 시클로 기사가 처음에는 10만동이라고 했지만 도착 후 50만동을 요구했습니다."
            className="w-full rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34 focus:border-white/36"
          />
        </label>

        <button
          type="submit"
          disabled={reportState.status === "submitting"}
          className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-70"
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
