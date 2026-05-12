"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
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
  GeoDbCitySuggestion,
  ReportPayload,
  ReportSubmissionResult,
  RiskLevel,
  RoadSegment,
} from "@/lib/types";

const riskCopy: Record<RiskLevel, string> = {
  Green: "비교적 안정",
  Yellow: "주의 필요",
  Orange: "반복 신고 감지",
  Red: "우회 권장",
};

type DashboardProps = {
  cities: CityData[];
};

type AppTab = "map" | "report";

const initialReportState = {
  status: "idle" as "idle" | "submitting" | "success" | "error",
  message: "",
};

export function Dashboard({ cities }: DashboardProps) {
  const [activeCityId, setActiveCityId] = useState(cities[0]?.id ?? "");
  const [selectedSegmentId, setSelectedSegmentId] = useState(
    cities[0]?.segments[0]?.id ?? "",
  );
  const [activeTab, setActiveTab] = useState<AppTab>("map");
  const [reportState, setReportState] = useState(initialReportState);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoDbCitySuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
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

  useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      try {
        const query = searchQuery.trim();
        const response = await fetch(
          `/api/geodb/cities${query ? `?q=${encodeURIComponent(query)}` : ""}`,
          { signal: controller.signal },
        );
        const json = (await response.json()) as {
          data?: GeoDbCitySuggestion[];
        };
        setSearchResults(json.data ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
        }
      }
    }

    loadCities();

    return () => controller.abort();
  }, [searchQuery]);

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

  function selectCity(cityId: string) {
    const nextCity = cities.find((city) => city.id === cityId);
    if (!nextCity) {
      return;
    }
    setActiveCityId(cityId);
    setSelectedSegmentId(nextCity.segments[0]?.id ?? "");
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071019] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(90,105,173,0.22),transparent_18%),radial-gradient(circle_at_82%_20%,rgba(30,193,163,0.16),transparent_18%),linear-gradient(180deg,#04070b_0%,#081018_55%,#04070a_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:84px_84px]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1320px] flex-col items-center justify-center gap-8 px-4 py-8 xl:flex-row xl:justify-between">
        <div className="w-full max-w-[290px] xl:max-w-[310px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/68">
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">
                Nohook beta
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1">
                베트남 거리 위험 지도
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.06em] text-white xl:text-[3rem]">
              아이폰 앱처럼
              <br />
              위험 도로를 먼저
              <br />
              보여줍니다
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/72">
              지도 위 요소를 줄여서 실제 도로가 먼저 보이도록 정리했습니다.
              도시 검색은 GeoDB 기반으로 연결되어 있습니다.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <HeroStat label="모니터링" value="6" />
              <HeroStat label="고위험" value="2" />
              <HeroStat label="최근 신고" value="33" />
            </div>
          </div>
        </div>

        <IPhoneMockup>
          <div className="relative flex h-full flex-col overflow-hidden bg-[#070d14] text-white">
            <div className="relative z-30 flex items-center justify-between px-6 pb-2 pt-5 text-[13px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-white/72">
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
              </div>
            </div>

            <div className="relative z-30 px-4">
              <div className="rounded-[1.45rem] border border-white/10 bg-black/34 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/44">
                      Nohook
                    </p>
                    <h2 className="mt-1 text-[1.45rem] font-semibold tracking-[-0.05em]">
                      오늘 걸을 거리
                    </h2>
                  </div>
                  <Link
                    href="/admin"
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[11px] text-white/76"
                  >
                    운영
                  </Link>
                </div>

                <div className="relative mt-3">
                  <div className="rounded-[0.95rem] border border-white/10 bg-white/6 px-4 py-2.5">
                    <input
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setSearchOpen(true);
                      }}
                      onFocus={() => setSearchOpen(true)}
                      placeholder="GeoDB로 베트남 도시 검색"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/36"
                    />
                  </div>

                  {searchOpen ? (
                    <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[1rem] border border-white/10 bg-[#0b121a] shadow-[0_20px_40px_rgba(0,0,0,0.32)]">
                      {searchResults.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto p-2">
                          {searchResults.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                if (item.supportedCityId) {
                                  selectCity(item.supportedCityId);
                                } else {
                                  setSearchOpen(false);
                                  setSearchQuery(item.name);
                                }
                              }}
                              className="flex w-full items-start justify-between rounded-[0.9rem] px-3 py-2.5 text-left hover:bg-white/6"
                            >
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-xs text-white/54">
                                  {item.region}, {item.country}
                                </p>
                              </div>
                              <span className="text-[11px] text-white/44">
                                {item.supportedCityId ? "지원" : "준비중"}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-4 text-sm text-white/58">
                          검색 결과가 없습니다.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => selectCity(city.id)}
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

            <div className="relative z-0 mt-3 flex-1 px-4 pb-4">
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#091018] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <GoogleRiskMap
                  ref={mapRef}
                  city={activeCity}
                  selectedSegmentId={selectedSegment.id}
                  onSelectSegment={setSelectedSegmentId}
                />

                <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-black/44 px-3 py-1.5 text-[11px] font-medium text-white/88 backdrop-blur-xl">
                    {activeCity.label}
                  </span>
                  <span
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_12px_22px_rgba(0,0,0,0.22)]"
                    style={{
                      backgroundColor: riskPalette[selectedSegment.riskLevel],
                    }}
                  >
                    {riskLabelMap[selectedSegment.riskLevel]}
                  </span>
                </div>

                <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
                  <MapButton
                    label="+"
                    onClick={() => mapRef.current?.zoomIn()}
                  />
                  <MapButton
                    label="-"
                    onClick={() => mapRef.current?.zoomOut()}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-3">
                  <div className="rounded-[1.55rem] border border-white/10 bg-[rgba(7,12,18,0.86)] shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                    <div className="border-b border-white/8 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">
                            선택 도로
                          </p>
                          <p className="mt-1 truncate text-base font-semibold tracking-[-0.03em]">
                            {selectedSegment.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-white/58">
                            {selectedSegment.summary}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/72">
                          최근 신고 {selectedSegment.recentReportCount}건
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 px-4 pt-3">
                      <TabButton
                        active={activeTab === "map"}
                        label="위험 정보"
                        onClick={() => setActiveTab("map")}
                      />
                      <TabButton
                        active={activeTab === "report"}
                        label="신고하기"
                        onClick={() => setActiveTab("report")}
                      />
                    </div>

                    <div className="max-h-[24vh] overflow-y-auto px-4 pb-4 pt-3">
                      {activeTab === "map" ? (
                        <InsightPanel
                          segment={selectedSegment}
                          city={activeCity}
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
          </div>
        </IPhoneMockup>
      </section>
    </main>
  );
}

function IPhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[min(88vw,390px)] shrink-0 xl:max-w-[380px]">
      <div className="pointer-events-none absolute -inset-8 rounded-[4rem] bg-[radial-gradient(circle_at_50%_16%,rgba(59,130,246,0.16),transparent_22%),radial-gradient(circle_at_50%_84%,rgba(16,185,129,0.12),transparent_18%)] blur-3xl" />
      <div className="relative rounded-[3.25rem] border border-white/12 bg-[#d2d6de] p-[9px] shadow-[0_44px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute left-1/2 top-[14px] z-30 h-7 w-34 -translate-x-1/2 rounded-full bg-[#0a0f16]" />
        <div className="relative overflow-hidden rounded-[2.7rem] bg-[#070d14]">
          <div className="aspect-[420/860] w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-white/6 px-3 py-3">
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
      className="flex h-9 w-9 items-center justify-center rounded-[1rem] border border-white/10 bg-black/48 text-base font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.26)] backdrop-blur-xl"
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
  segment,
  city,
}: {
  segment: RoadSegment;
  city: CityData;
}) {
  return (
    <div className="space-y-3">
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
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] text-white/78"
          >
            {categoryLabelMap[category] ?? category}
          </span>
        ))}
      </div>

      <div className="space-y-2.5">
        {segment.placeSignals.map((signal) => (
          <div
            key={signal.placeName}
            className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {signal.placeName}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  {signal.signalType}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/72">
                신호 {signal.signalScore}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/68">
        현재 추적 중인 지역: {city.label}
      </div>
    </div>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">
        {label}
      </p>
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
    <section className="space-y-4">
      <div className="rounded-[1rem] border border-white/10 bg-white/6 p-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/46">
          선택 구간
        </p>
        <p className="mt-2 text-base font-semibold">{selectedSegment.name}</p>
        <p className="mt-1 text-sm text-white/60">{city.label}</p>
      </div>

      <form action={onSubmit} className="space-y-4">
        <input type="hidden" name="segmentId" value={selectedSegment.id} />

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
            className="w-full rounded-[1.1rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34 focus:border-white/36"
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
