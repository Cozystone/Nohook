"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabelMap,
  categoryLabelMapEn,
  formatPrice,
  getStoreProductPrice,
  getStoresForProduct,
  resolveProductQuery,
  riskLabelMap,
  riskLabelMapEn,
  riskPalette,
  timeBucketLabelMap,
  timeBucketLabelMapEn,
  travelerTypeLabelMap,
  travelerTypeLabelMapEn,
} from "@/lib/data";
import { GoogleRiskMap, type RiskMapHandle } from "@/components/google-risk-map";
import type {
  AppLocale,
  CityData,
  GeoDbCitySuggestion,
  ProductCatalogItem,
  ReportPayload,
  ReportSubmissionResult,
  RiskLevel,
  RoadSegment,
  StoreListing,
} from "@/lib/types";

const riskCopy: Record<AppLocale, Record<RiskLevel, string>> = {
  ko: {
    Green: "비교적 안정",
    Yellow: "주의 필요",
    Orange: "반복 신고 감지",
    Red: "우회 권장",
  },
  en: {
    Green: "Relatively stable",
    Yellow: "Needs caution",
    Orange: "Repeated reports detected",
    Red: "Detour recommended",
  },
};

const zoomThreshold = 17;

const uiCopy = {
  ko: {
    beta: "Nohook beta",
    mapTag: "베트남 거리 위험 지도",
    heroTitle: "위험 거리부터\n지도로 봅니다",
    heroBody: "언어 전환과 상품 입력만 남기고, 지도 비중을 키웠습니다.",
    monitoring: "모니터링",
    highRisk: "고위험",
    recentReports: "최근 신고",
    todayRoute: "오늘 걸을 거리",
    admin: "운영",
    citySearchPlaceholder: "GeoDB로 베트남 도시 검색",
    itemSearchPlaceholder: "살 물건 입력 예: 커피, 아오자이, 건망고",
    searchEmpty: "검색 결과가 없습니다.",
    supported: "지원",
    unsupported: "준비중",
    itemAiMatched: "AI 인식",
    itemAiNoMatch: "AI가 아직 상품을 인식하지 못했습니다.",
    itemZoomHint: "가격 라벨은 지도를 더 확대하면 나타납니다.",
    itemZoomReady: "확대된 상태에서 가게별 평균 가격을 표시합니다.",
    itemRecommendations: "추천 가게",
    cityOverlay: "도로 오버레이",
    selectedRoad: "선택 도로",
    riskInfo: "위험 정보",
    report: "신고하기",
    reportCount: "최근 신고",
    score: "점수",
    judgement: "판단",
    reports: "신고",
    type: "유형",
    trackingArea: "현재 추적 지역",
    selectSegment: "선택 구간",
    reportType: "신고 유형",
    incidentTime: "발생 시간대",
    travelerType: "여행 형태",
    note: "상황 메모",
    notePlaceholder:
      "예: 시클로 기사가 처음에는 10만동이라고 했지만 도착 후 50만동을 요구했습니다.",
    reportSubmitting: "전송 중...",
    reportSubmit: "익명 신고 제출",
    reportSending: "현장 신고를 전송하는 중입니다...",
    reportError: "신고 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    priceAverage: "평균",
    shopsFound: "개 가게",
  },
  en: {
    beta: "Nohook beta",
    mapTag: "Vietnam street risk map",
    heroTitle: "See risky\nstreets first",
    heroBody: "Less text, more map. Language toggle and shopping search stay on top.",
    monitoring: "Tracking",
    highRisk: "High risk",
    recentReports: "Recent reports",
    todayRoute: "Streets to walk today",
    admin: "Admin",
    citySearchPlaceholder: "Search Vietnam cities with GeoDB",
    itemSearchPlaceholder: "Type what to buy: coffee, ao dai, dried mango",
    searchEmpty: "No search results.",
    supported: "Supported",
    unsupported: "Soon",
    itemAiMatched: "AI match",
    itemAiNoMatch: "AI could not identify that item yet.",
    itemZoomHint: "Zoom in more to reveal price labels on shops.",
    itemZoomReady: "Shop-level average prices are visible at this zoom.",
    itemRecommendations: "Suggested shops",
    cityOverlay: "Road overlay",
    selectedRoad: "Selected road",
    riskInfo: "Risk info",
    report: "Report",
    reportCount: "Recent reports",
    score: "Score",
    judgement: "Judgement",
    reports: "Reports",
    type: "Type",
    trackingArea: "Tracking area",
    selectSegment: "Selected segment",
    reportType: "Report type",
    incidentTime: "Time bucket",
    travelerType: "Travel style",
    note: "Situation note",
    notePlaceholder:
      "Example: The cyclo driver first said 100,000 VND, then demanded 500,000 VND at drop-off.",
    reportSubmitting: "Sending...",
    reportSubmit: "Submit anonymous report",
    reportSending: "Sending your on-site report...",
    reportError: "Failed to submit the report. Please try again shortly.",
    priceAverage: "Avg",
    shopsFound: "shops",
  },
} as const;

type DashboardProps = {
  cities: CityData[];
};

type AppTab = "map" | "report";
type SheetMode = "peek" | "mid" | "full";

const initialReportState = {
  status: "idle" as "idle" | "submitting" | "success" | "error",
  message: "",
};

export function Dashboard({ cities }: DashboardProps) {
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [activeCityId, setActiveCityId] = useState(cities[0]?.id ?? "");
  const [selectedSegmentId, setSelectedSegmentId] = useState(cities[0]?.segments[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<AppTab>("map");
  const [sheetMode, setSheetMode] = useState<SheetMode>("peek");
  const [reportState, setReportState] = useState(initialReportState);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoDbCitySuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const mapRef = useRef<RiskMapHandle | null>(null);
  const t = uiCopy[locale];

  const activeCity = useMemo(
    () => cities.find((city) => city.id === activeCityId) ?? cities[0],
    [activeCityId, cities],
  );

  const selectedSegment = useMemo(
    () => activeCity.segments.find((segment) => segment.id === selectedSegmentId) ?? activeCity.segments[0],
    [activeCity, selectedSegmentId],
  );

  const matchedProduct = useMemo(() => resolveProductQuery(itemQuery), [itemQuery]);
  const matchedStores = useMemo(
    () => (matchedProduct ? getStoresForProduct(activeCity, matchedProduct.id) : []),
    [activeCity, matchedProduct],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      try {
        const query = citySearchQuery.trim();
        const response = await fetch(
          `/api/geodb/cities${query ? `?q=${encodeURIComponent(query)}` : ""}`,
          { signal: controller.signal },
        );
        const json = (await response.json()) as { data?: GeoDbCitySuggestion[] };
        setSearchResults(json.data ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
        }
      }
    }

    loadCities();
    return () => controller.abort();
  }, [citySearchQuery]);

  async function handleSubmit(formData: FormData) {
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    const requestBody: ReportPayload = {
      cityId: activeCity.id,
      segmentId: payload.segmentId,
      category: payload.category,
      incidentTimeBucket: payload.incidentTimeBucket,
      note: payload.note,
      travelerType: payload.travelerType,
    };

    setReportState({ status: "submitting", message: t.reportSending });

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Unable to submit report");
      }

      const result = (await response.json()) as ReportSubmissionResult;
      startTransition(() => {
        setReportState({ status: "success", message: result.message });
        setActiveTab("report");
        setSheetMode("full");
      });
    } catch {
      setReportState({ status: "error", message: t.reportError });
    }
  }

  function selectCity(cityId: string) {
    const nextCity = cities.find((city) => city.id === cityId);
    if (!nextCity) return;
    setActiveCityId(cityId);
    setSelectedSegmentId(nextCity.segments[0]?.id ?? "");
    setSearchOpen(false);
    setCitySearchQuery("");
  }

  function getCategoryLabel(category: string) {
    return locale === "ko"
      ? categoryLabelMap[category] ?? category
      : categoryLabelMapEn[category] ?? category;
  }

  function cycleSheetMode() {
    setSheetMode((current) =>
      current === "peek" ? "mid" : current === "mid" ? "full" : "peek",
    );
  }

  const sheetHeightClass =
    activeTab === "report"
      ? sheetMode === "peek"
        ? "max-h-[12vh]"
        : sheetMode === "mid"
          ? "max-h-[20vh]"
          : "max-h-[36vh]"
      : sheetMode === "peek"
        ? "max-h-[7vh]"
        : sheetMode === "mid"
          ? "max-h-[13vh]"
          : "max-h-[22vh]";

  return (
    <main className="min-h-screen overflow-hidden bg-[#071019] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(90,105,173,0.22),transparent_18%),radial-gradient(circle_at_82%_20%,rgba(30,193,163,0.16),transparent_18%),linear-gradient(180deg,#04070b_0%,#081018_55%,#04070a_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:84px_84px]" />

      <div className="absolute left-4 top-4 z-40 flex gap-2">
        <LocaleButton active={locale === "ko"} label="한" onClick={() => setLocale("ko")} />
        <LocaleButton active={locale === "en"} label="EN" onClick={() => setLocale("en")} />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col items-center justify-center gap-4 px-4 py-5 xl:flex-row xl:justify-between">
        <div className="w-full max-w-[228px] xl:max-w-[240px]">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-3.5 shadow-[0_24px_72px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/68">
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">{t.beta}</span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1">{t.mapTag}</span>
            </div>
            <h1 className="mt-3 whitespace-pre-line text-[2rem] font-semibold leading-[0.94] tracking-[-0.07em] text-white xl:text-[2.15rem]">{t.heroTitle}</h1>
            <p className="mt-2 text-[12px] leading-5 text-white/68">{t.heroBody}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <HeroStat label={t.monitoring} value="6" />
              <HeroStat label={t.highRisk} value="2" />
              <HeroStat label={t.recentReports} value="33" />
            </div>
          </div>
        </div>

        <IPhoneMockup>
          <div className="relative flex h-full flex-col overflow-hidden bg-[#070d14] text-white">
            <div className="relative z-30 flex items-center justify-between px-5 pb-1.5 pt-4 text-[12px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-white/72">
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
              </div>
            </div>

            <div className="relative z-30 px-3">
              <div className="rounded-[1.08rem] border border-white/10 bg-black/28 px-3 py-2 shadow-[0_12px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/44">Nohook</p>
                    <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.05em]">{t.todayRoute}</h2>
                  </div>
                  <Link href="/admin" className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1.5 text-[10px] text-white/76">{t.admin}</Link>
                </div>

                <SearchBox value={citySearchQuery} onChange={(value) => { setCitySearchQuery(value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder={t.citySearchPlaceholder} />
                {searchOpen ? (
                  <div className="relative mt-2 overflow-hidden rounded-[1rem] border border-white/10 bg-[#0b121a] shadow-[0_20px_40px_rgba(0,0,0,0.32)]">
                    {searchResults.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto p-2">
                        {searchResults.map((item) => (
                          <button key={item.id} type="button" onClick={() => { if (item.supportedCityId) { selectCity(item.supportedCityId); } else { setSearchOpen(false); setCitySearchQuery(item.name); } }} className="flex w-full items-start justify-between rounded-[0.9rem] px-3 py-2.5 text-left hover:bg-white/6">
                            <div>
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <p className="mt-1 text-xs text-white/54">{item.region}, {item.country}</p>
                            </div>
                            <span className="text-[11px] text-white/44">{item.supportedCityId ? t.supported : t.unsupported}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-white/58">{t.searchEmpty}</div>
                    )}
                  </div>
                ) : null}

                <SearchBox value={itemQuery} onChange={setItemQuery} placeholder={t.itemSearchPlaceholder} />

                {itemQuery.trim() ? (
                  <div className="mt-2 rounded-[1rem] border border-white/8 bg-white/5 px-3 py-2.5">
                    {matchedProduct ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{t.itemAiMatched}</p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">{locale === "ko" ? matchedProduct.name : matchedProduct.nameEn}</p>
                          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] text-white/70">{matchedStores.length} {t.shopsFound}</span>
                        </div>
                        <p className="text-xs text-white/60">{mapZoom >= zoomThreshold ? t.itemZoomReady : t.itemZoomHint}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">{t.itemAiNoMatch}</p>
                    )}
                  </div>
                ) : null}

                <div className="mt-2.5 flex gap-2">
                  {cities.map((city) => (
                    <button key={city.id} type="button" onClick={() => selectCity(city.id)} className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${city.id === activeCityId ? "bg-white text-stone-950" : "border border-white/12 bg-white/6 text-white/78"}`}>
                      {locale === "ko" ? city.shortLabel : city.shortLabelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-0 mt-2 flex-1 px-3 pb-3">
              <div className="relative h-full overflow-hidden rounded-[1.72rem] border border-white/10 bg-[#091018] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <GoogleRiskMap ref={mapRef} city={activeCity} selectedSegmentId={selectedSegment.id} selectedProductId={matchedProduct?.id} locale={locale} onSelectSegment={setSelectedSegmentId} onZoomLevelChange={setMapZoom} />

                <div className="absolute left-2 top-2 z-30 flex flex-wrap items-center gap-1">
                  <span className="rounded-full border border-white/10 bg-black/44 px-2 py-1 text-[9px] font-medium text-white/88 backdrop-blur-xl">{locale === "ko" ? activeCity.shortLabel : activeCity.shortLabelEn}</span>
                  <span className="rounded-full px-2 py-1 text-[9px] font-semibold text-white shadow-[0_10px_18px_rgba(0,0,0,0.2)]" style={{ backgroundColor: riskPalette[selectedSegment.riskLevel] }}>
                    {locale === "ko" ? riskLabelMap[selectedSegment.riskLevel] : riskLabelMapEn[selectedSegment.riskLevel]}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/44 px-2 py-1 text-[9px] text-white/82 backdrop-blur-xl">{t.cityOverlay}</span>
                </div>

                <div className="absolute right-2 top-2 z-30 flex flex-col gap-1.5">
                  <MapButton label="+" onClick={() => mapRef.current?.zoomIn()} />
                  <MapButton label="-" onClick={() => mapRef.current?.zoomOut()} />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-30 px-2 pb-2">
                  <div className={`rounded-[1.2rem] border border-white/10 bg-[rgba(7,12,18,0.82)] shadow-[0_16px_32px_rgba(0,0,0,0.24)] backdrop-blur-xl ${activeTab === "report" ? "" : "bg-[rgba(7,12,18,0.76)]"}`}>
                    <div className="flex items-center justify-center pt-1.5">
                      <button
                        type="button"
                        onClick={cycleSheetMode}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[9px] text-white/72"
                      >
                        <span className="block h-1 w-8 rounded-full bg-white/38" />
                        <span>
                          {locale === "ko"
                            ? sheetMode === "peek"
                              ? "올려보기"
                              : sheetMode === "mid"
                                ? "더 열기"
                                : "내리기"
                            : sheetMode === "peek"
                              ? "Raise"
                              : sheetMode === "mid"
                                ? "Expand"
                                : "Lower"}
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-b border-white/8 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">{t.selectedRoad}</p>
                        <p className="mt-1 truncate text-[12px] font-semibold tracking-[-0.03em]">{locale === "ko" ? selectedSegment.name : selectedSegment.nameEn}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[9px] text-white/72">{selectedSegment.recentReportCount}</span>
                    </div>

                    <div className="flex gap-2 px-3 pt-2">
                      <TabButton active={activeTab === "map"} label={t.riskInfo} onClick={() => setActiveTab("map")} />
                      <TabButton active={activeTab === "report"} label={t.report} onClick={() => setActiveTab("report")} />
                    </div>

                    <div className={`overflow-y-auto px-3 pb-3 pt-2 ${sheetHeightClass}`}>
                      {activeTab === "map" ? (
                        <InsightPanel city={activeCity} locale={locale} matchedProduct={matchedProduct} matchedStores={matchedStores} selectedSegment={selectedSegment} zoomLevel={mapZoom} zoomThreshold={zoomThreshold} getCategoryLabel={getCategoryLabel} />
                      ) : (
                        <ReportPanel city={activeCity} locale={locale} reportState={reportState} selectedSegment={selectedSegment} onSubmit={handleSubmit} />
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

function SearchBox({ value, onChange, onFocus, placeholder }: { value: string; onChange: (value: string) => void; onFocus?: () => void; placeholder: string; }) {
  return (
    <div className="mt-2.5 rounded-[0.9rem] border border-white/10 bg-white/6 px-3.5 py-2">
      <input value={value} onChange={(event) => onChange(event.target.value)} onFocus={onFocus} placeholder={placeholder} className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/36" />
    </div>
  );
}

function IPhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[min(84vw,372px)] shrink-0 xl:max-w-[364px]">
      <div className="pointer-events-none absolute -inset-8 rounded-[4rem] bg-[radial-gradient(circle_at_50%_16%,rgba(59,130,246,0.16),transparent_22%),radial-gradient(circle_at_50%_84%,rgba(16,185,129,0.12),transparent_18%)] blur-3xl" />
      <div className="relative rounded-[3rem] border border-white/12 bg-[#d2d6de] p-[8px] shadow-[0_40px_88px_rgba(0,0,0,0.46),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute left-1/2 top-[14px] z-30 h-7 w-34 -translate-x-1/2 rounded-full bg-[#0a0f16]" />
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#070d14]"><div className="aspect-[420/860] w-full">{children}</div></div>
      </div>
    </div>
  );
}

function LocaleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-xl ${active ? "border-white/14 bg-white text-stone-950" : "border-white/10 bg-black/28 text-white/78"}`}>{label}</button>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/6 px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.12em] text-white/48">{label}</p><p className="mt-1.5 text-[1.7rem] font-semibold tracking-[-0.04em] text-white">{value}</p></div>
  );
}

function MapButton({ label, onClick }: { label: string; onClick: () => void; }) {
  return <button type="button" onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-[0.9rem] border border-white/10 bg-black/48 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.24)] backdrop-blur-xl">{label}</button>;
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void; }) {
  return <button type="button" onClick={onClick} className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-white text-stone-950" : "text-white/70 hover:bg-white/8 hover:text-white"}`}>{label}</button>;
}

function InsightPanel({ city, locale, matchedProduct, matchedStores, selectedSegment, zoomLevel, zoomThreshold, getCategoryLabel, }: { city: CityData; locale: AppLocale; matchedProduct: ProductCatalogItem | null; matchedStores: StoreListing[]; selectedSegment: RoadSegment; zoomLevel: number; zoomThreshold: number; getCategoryLabel: (category: string) => string; }) {
  const t = uiCopy[locale];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <InfoMetricCompact label={t.score} value={selectedSegment.riskScore.toString()} />
        <InfoMetricCompact label={t.judgement} value={riskCopy[locale][selectedSegment.riskLevel]} />
        <InfoMetricCompact label={t.reports} value={`${selectedSegment.recentReportCount}`} />
        <InfoMetricCompact label={t.type} value={getCategoryLabel(selectedSegment.topCategories[0])} />
      </div>
      <div className="flex flex-wrap gap-2">{selectedSegment.topCategories.map((category) => <span key={category} className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1.5 text-[10px] text-white/78">{getCategoryLabel(category)}</span>)}</div>
      <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3.5 py-3 text-xs leading-5 text-white/68">{locale === "ko" ? selectedSegment.summary : selectedSegment.summaryEn}<br />{t.trackingArea}: {locale === "ko" ? city.label : city.labelEn}</div>
      {matchedProduct ? (
        <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3.5 py-3">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-white">{t.itemRecommendations}</p><span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] text-white/72">{locale === "ko" ? matchedProduct.name : matchedProduct.nameEn}</span></div>
          <p className="mt-2 text-xs text-white/58">{zoomLevel >= zoomThreshold ? t.itemZoomReady : t.itemZoomHint}</p>
          <div className="mt-3 space-y-2">
            {matchedStores.slice(0, 3).map((store) => {
              const price = getStoreProductPrice(store, matchedProduct.id);
              if (!price) return null;
              return <div key={store.id} className="rounded-[0.95rem] border border-white/8 bg-black/20 px-3 py-2.5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-white">{locale === "ko" ? store.name : store.nameEn}</p><p className="mt-1 text-[11px] text-white/58">{locale === "ko" ? price.note : price.noteEn}</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-950">{t.priceAverage} {formatPrice(price.currency, price.avgPrice, locale)}</span></div></div>;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoMetricCompact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.12em] text-white/46">{label}</p><p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-4 text-white">{value}</p></div>;
}

function ReportPanel({ city, locale, reportState, selectedSegment, onSubmit }: { city: CityData; locale: AppLocale; reportState: { status: "idle" | "submitting" | "success" | "error"; message: string; }; selectedSegment: RoadSegment; onSubmit: (formData: FormData) => Promise<void>; }) {
  const t = uiCopy[locale];
  const categories = locale === "ko" ? categoryLabelMap : categoryLabelMapEn;
  const times = locale === "ko" ? timeBucketLabelMap : timeBucketLabelMapEn;
  const travelers = locale === "ko" ? travelerTypeLabelMap : travelerTypeLabelMapEn;
  return (
    <section className="space-y-4">
      <div className="rounded-[1rem] border border-white/10 bg-white/6 p-4"><p className="text-[11px] uppercase tracking-[0.12em] text-white/46">{t.selectSegment}</p><p className="mt-2 text-base font-semibold">{locale === "ko" ? selectedSegment.name : selectedSegment.nameEn}</p><p className="mt-1 text-sm text-white/60">{locale === "ko" ? city.label : city.labelEn}</p></div>
      <form action={onSubmit} className="space-y-4">
        <input type="hidden" name="segmentId" value={selectedSegment.id} />
        <label className="block space-y-2"><span className="text-sm font-medium text-white/82">{t.reportType}</span><select name="category" defaultValue={selectedSegment.topCategories[0]} className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-white/36">{Object.entries(categories).map(([category, label]) => <option key={category} value={category} className="text-stone-950">{label}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2"><span className="text-sm font-medium text-white/82">{t.incidentTime}</span><select name="incidentTimeBucket" defaultValue="Evening" className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-white/36">{Object.entries(times).map(([value, label]) => <option key={value} value={value} className="text-stone-950">{label}</option>)}</select></label>
          <label className="block space-y-2"><span className="text-sm font-medium text-white/82">{t.travelerType}</span><select name="travelerType" defaultValue="Solo traveler" className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none focus:border-white/36">{Object.entries(travelers).map(([value, label]) => <option key={value} value={value} className="text-stone-950">{label}</option>)}</select></label>
        </div>
        <label className="block space-y-2"><span className="text-sm font-medium text-white/82">{t.note}</span><textarea name="note" rows={4} placeholder={t.notePlaceholder} className="w-full rounded-[1.1rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/34 focus:border-white/36" /></label>
        <button type="submit" disabled={reportState.status === "submitting"} className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-70">{reportState.status === "submitting" ? t.reportSubmitting : t.reportSubmit}</button>
        {reportState.status !== "idle" ? <p className={`rounded-2xl px-4 py-3 text-sm ${reportState.status === "success" ? "bg-[#163d35] text-[#d4f1e6]" : reportState.status === "error" ? "bg-[#4c1f1a] text-[#ffd6cf]" : "bg-white/10 text-white/72"}`}>{reportState.message}</p> : null}
      </form>
    </section>
  );
}

