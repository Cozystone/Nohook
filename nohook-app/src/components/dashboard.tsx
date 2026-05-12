"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabelMap,
  categoryLabelMapEn,
  formatPrice,
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
  PlaceSignal,
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
    Orange: "Repeated reports",
    Red: "Detour suggested",
  },
};

const glassPanel =
  "border border-[#93c5fd]/18 bg-[linear-gradient(180deg,rgba(10,20,38,0.78)_0%,rgba(11,18,31,0.64)_100%)] shadow-[0_18px_48px_rgba(2,6,23,0.34)] backdrop-blur-2xl";

const uiCopy = {
  ko: {
    beta: "베트남 거리 위험 지도",
    admin: "운영",
    citySearchPlaceholder: "호치민, 하노이처럼 도시 검색",
    searchEmpty: "검색 결과가 없습니다.",
    supported: "지원",
    unsupported: "준비중",
    selectedRoad: "선택 도로",
    score: "점수",
    judgement: "판단",
    reports: "신고",
    type: "유형",
    trackingArea: "지역",
    selectSegment: "선택 구간",
    reportType: "신고 유형",
    incidentTime: "시간대",
    travelerType: "여행 형태",
    note: "메모",
    notePlaceholder: "예: 처음엔 낮은 가격을 말하고 도착 후 추가 요금을 요구했습니다.",
    reportSubmitting: "전송 중...",
    reportSubmit: "익명 신고 제출",
    reportSending: "신고를 전송하는 중입니다...",
    reportError: "신고 전송에 실패했습니다.",
    searchLabel: "도시",
    popupOpen: "열기",
    popupClose: "닫기",
    popupReport: "신고",
    popupBack: "정보",
    fairPrice: "적정가격",
    reviewSignal: "리뷰 신호",
    storesNearby: "주변 상점 기준",
    pricePending: "주변 상점 기준 적정가 준비중",
    help: "?",
    helpHint: "위험 도로와 상점 밀집 거리를 함께 봅니다.",
  },
  en: {
    beta: "Vietnam street risk map",
    admin: "Admin",
    citySearchPlaceholder: "Search a city like Hanoi or HCMC",
    searchEmpty: "No search results.",
    supported: "Supported",
    unsupported: "Soon",
    selectedRoad: "Selected road",
    score: "Score",
    judgement: "Judgement",
    reports: "Reports",
    type: "Type",
    trackingArea: "Area",
    selectSegment: "Selected segment",
    reportType: "Report type",
    incidentTime: "Time",
    travelerType: "Traveler",
    note: "Note",
    notePlaceholder: "Example: The driver quoted low first, then demanded more at arrival.",
    reportSubmitting: "Sending...",
    reportSubmit: "Submit report",
    reportSending: "Sending your report...",
    reportError: "Failed to submit the report.",
    searchLabel: "City",
    popupOpen: "Open",
    popupClose: "Close",
    popupReport: "Report",
    popupBack: "Info",
    fairPrice: "Fair price",
    reviewSignal: "Review signal",
    storesNearby: "Nearby store baseline",
    pricePending: "Fair-price baseline pending",
    help: "?",
    helpHint: "View risk roads and shop-density streets together.",
  },
} as const;

type DashboardProps = {
  cities: CityData[];
};

type PopupTab = "info" | "report";
type MapStyle = "satellite" | "roadmap";

type FairPriceSummary = {
  avgPrice: number;
  currency: string;
  label: string;
  note: string;
} | null;

const initialReportState = {
  status: "idle" as "idle" | "submitting" | "success" | "error",
  message: "",
};

export function Dashboard({ cities }: DashboardProps) {
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [activeCityId, setActiveCityId] = useState(cities[0]?.id ?? "");
  const [selectedSegmentId, setSelectedSegmentId] = useState(cities[0]?.segments[0]?.id ?? "");
  const [popupTab, setPopupTab] = useState<PopupTab>("info");
  const [popupExpanded, setPopupExpanded] = useState(false);
  const [reportState, setReportState] = useState(initialReportState);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoDbCitySuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>("satellite");
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

  const fairPrice = useMemo(
    () => getSegmentFairPrice(activeCity.storeListings, selectedSegment.id, locale),
    [activeCity.storeListings, locale, selectedSegment.id],
  );

  const reviewSignals = useMemo(
    () => buildReviewCards(selectedSegment.placeSignals, locale),
    [locale, selectedSegment.placeSignals],
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

      if (!response.ok) throw new Error("Unable to submit report");

      const result = (await response.json()) as ReportSubmissionResult;
      startTransition(() => {
        setReportState({ status: "success", message: result.message });
        setPopupTab("report");
        setPopupExpanded(true);
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
    setPopupExpanded(false);
    setPopupTab("info");
  }

  function handleSelectSegment(segmentId: string) {
    setSelectedSegmentId(segmentId);
    setPopupExpanded(true);
    setPopupTab("info");
  }

  function getCategoryLabel(category: string) {
    return locale === "ko"
      ? categoryLabelMap[category] ?? category
      : categoryLabelMapEn[category] ?? category;
  }

  const popupClass = popupExpanded
    ? "w-[min(78vw,304px)] max-h-[46vh]"
    : "w-[min(58vw,214px)] max-h-[112px]";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071019] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(59,130,246,0.28),transparent_18%),radial-gradient(circle_at_84%_18%,rgba(56,189,248,0.18),transparent_18%),linear-gradient(180deg,#04070b_0%,#081224_55%,#05101f_100%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:84px_84px]" />

      <div className="absolute left-4 top-4 z-40 flex gap-2">
        <LocaleButton active={locale === "ko"} label="한" onClick={() => setLocale("ko")} />
        <LocaleButton active={locale === "en"} label="EN" onClick={() => setLocale("en")} />
      </div>

      <section className="relative z-20 flex min-h-screen items-center justify-center px-4 py-8">
        <IPhoneMockup>
          <div className="relative h-full overflow-hidden bg-[#070d14] text-white">
            <div className="absolute inset-0 z-0">
              <GoogleRiskMap
                ref={mapRef}
                city={activeCity}
                selectedSegmentId={selectedSegment.id}
                locale={locale}
                mapStyle={mapStyle}
                onSelectSegment={handleSelectSegment}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(6,10,19,0.62)_0%,rgba(6,10,19,0.14)_22%,rgba(6,10,19,0)_40%,rgba(6,10,19,0.14)_100%)]" />

            <div className="relative z-30 flex items-center justify-between px-5 pb-1.5 pt-4 text-[12px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-white/72">
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
                <span className="h-2 w-2 rounded-full bg-white/75" />
              </div>
            </div>

            <div className="relative z-30 px-3 pb-3">
              <div className={`w-full rounded-[1.2rem] px-3 py-3 ${glassPanel}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#bfdbfe]">NOHOOK</p>
                    <p className="mt-1 text-[12px] text-white/62">{t.beta}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#93c5fd]/18 bg-white/8 text-[13px] text-white/78">{t.help}</button>
                    <Link href="/admin" className="rounded-full border border-[#93c5fd]/18 bg-white/8 px-3 py-1.5 text-[11px] text-white/78">{t.admin}</Link>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <TopSearchBox
                      value={citySearchQuery}
                      onChange={(value) => {
                        setCitySearchQuery(value);
                        setSearchOpen(true);
                      }}
                      onFocus={() => setSearchOpen(true)}
                      placeholder={t.citySearchPlaceholder}
                      label={t.searchLabel}
                    />
                    {searchOpen ? (
                      <div className={`absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-[1rem] ${glassPanel}`}>
                        {searchResults.length > 0 ? (
                          <div className="max-h-36 overflow-y-auto p-2">
                            {searchResults.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  if (item.supportedCityId) {
                                    selectCity(item.supportedCityId);
                                  } else {
                                    setSearchOpen(false);
                                    setCitySearchQuery(item.name);
                                  }
                                }}
                                className="flex w-full items-start justify-between rounded-[0.9rem] px-3 py-2 text-left transition hover:bg-white/8"
                              >
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
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => selectCity(city.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${city.id === activeCityId ? "bg-[#dbeafe] text-[#0f172a]" : "border border-[#93c5fd]/18 bg-white/8 text-white/80"}`}
                      >
                        {locale === "ko" ? city.shortLabel : city.shortLabelEn}
                      </button>
                    ))}
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_10px_18px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: riskPalette[selectedSegment.riskLevel] }}
                  >
                    {locale === "ko" ? riskLabelMap[selectedSegment.riskLevel] : riskLabelMapEn[selectedSegment.riskLevel]}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-[160px] z-30 flex flex-col gap-2">
              <div className="overflow-hidden rounded-[1rem] border border-[#93c5fd]/18 bg-[rgba(17,20,27,0.62)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setMapStyle("satellite")}
                  className={`block w-full px-3 py-2 text-[10px] font-medium transition ${mapStyle === "satellite" ? "bg-[#dbeafe] text-[#0f172a]" : "text-white/78"}`}
                >
                  {locale === "ko" ? "위성" : "Sat"}
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle("roadmap")}
                  className={`block w-full border-t border-white/10 px-3 py-2 text-[10px] font-medium transition ${mapStyle === "roadmap" ? "bg-[#dbeafe] text-[#0f172a]" : "text-white/78"}`}
                >
                  {locale === "ko" ? "지도" : "Map"}
                </button>
              </div>
              <MapButton label="+" onClick={() => mapRef.current?.zoomIn()} />
              <MapButton label="-" onClick={() => mapRef.current?.zoomOut()} />
            </div>

            <div className="absolute bottom-3 left-3 z-30">
              <div className={`overflow-hidden rounded-[1.15rem] ${glassPanel} transition-all duration-200 ${popupClass}`}>
                <div className="flex items-center justify-between gap-2 border-b border-[#93c5fd]/14 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">{t.selectedRoad}</p>
                    <p className="mt-1 truncate text-[12px] font-semibold tracking-[-0.03em] text-white">
                      {locale === "ko" ? selectedSegment.name : selectedSegment.nameEn}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPopupTab(popupTab === "info" ? "report" : "info");
                        setPopupExpanded(true);
                      }}
                      className="rounded-full border border-[#93c5fd]/18 bg-white/8 px-2 py-1 text-[10px] text-white/78"
                    >
                      {popupTab === "info" ? t.popupReport : t.popupBack}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopupExpanded((current) => !current)}
                      className="rounded-full border border-[#93c5fd]/18 bg-white/8 px-2 py-1 text-[10px] text-white/78"
                    >
                      {popupExpanded ? t.popupClose : t.popupOpen}
                    </button>
                  </div>
                </div>

                <div className="px-3 py-2.5">
                  {popupTab === "info" ? (
                    popupExpanded ? (
                      <InsightPanel
                        city={activeCity}
                        locale={locale}
                        fairPrice={fairPrice}
                        selectedSegment={selectedSegment}
                        reviewSignals={reviewSignals}
                        getCategoryLabel={getCategoryLabel}
                      />
                    ) : (
                      <CompactRoadPopup
                        locale={locale}
                        selectedSegment={selectedSegment}
                        fairPrice={fairPrice}
                      />
                    )
                  ) : (
                    <ReportPanel
                      city={activeCity}
                      locale={locale}
                      reportState={reportState}
                      selectedSegment={selectedSegment}
                      onSubmit={handleSubmit}
                      compact
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </IPhoneMockup>
      </section>
    </main>
  );
}

function getSegmentFairPrice(stores: StoreListing[], segmentId: string, locale: AppLocale): FairPriceSummary {
  const matchingStores = stores.filter((store) => store.segmentId === segmentId);
  const prices = matchingStores.flatMap((store) => store.items);
  if (prices.length === 0) return null;

  const avgPrice = Math.round(prices.reduce((sum, item) => sum + item.avgPrice, 0) / prices.length);
  const currency = prices[0].currency;
  const label = locale === "ko" ? "주변 상점 평균" : "Nearby average";
  const note = locale === "ko" ? `${matchingStores.length}개 상점 기준` : `Based on ${matchingStores.length} stores`;
  return { avgPrice, currency, label, note };
}

function buildReviewCards(signals: PlaceSignal[], locale: AppLocale) {
  return signals.slice(0, 3).map((signal) => ({
    title: locale === "ko" ? signal.signalType : signal.signalTypeEn,
    place: locale === "ko" ? signal.placeName : signal.placeNameEn,
    summary: locale === "ko" ? signal.evidence : signal.evidenceEn,
    score: signal.signalScore,
  }));
}

function TopSearchBox({
  value,
  onChange,
  onFocus,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[0.95rem] border border-[#93c5fd]/18 bg-white/8 px-3 py-2 backdrop-blur-xl">
      <span className="text-sm text-white/40">⌕</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-[0.16em] text-white/34">{label}</p>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className="mt-0.5 w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/32"
        />
      </div>
    </div>
  );
}

function IPhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[min(92vw,396px)] shrink-0">
      <div className="pointer-events-none absolute -inset-8 rounded-[4rem] bg-[radial-gradient(circle_at_50%_16%,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_50%_84%,rgba(14,165,233,0.12),transparent_18%)] blur-3xl" />
      <div className="relative rounded-[3rem] border border-white/12 bg-[#d6dae2] p-[8px] shadow-[0_40px_88px_rgba(0,0,0,0.44),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute left-1/2 top-[14px] z-30 h-7 w-34 -translate-x-1/2 rounded-full bg-[#0a0f16] opacity-95" />
        <div className="relative overflow-hidden rounded-[2.45rem] bg-[#070d14]">
          <div className="aspect-[430/790] w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

function LocaleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-xl ${active ? "border-white/14 bg-white text-stone-950" : "border-white/10 bg-black/28 text-white/78"}`}
    >
      {label}
    </button>
  );
}

function MapButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-[1rem] border border-[#93c5fd]/18 bg-[rgba(17,20,27,0.62)] text-[16px] font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.22)] backdrop-blur-xl"
    >
      {label}
    </button>
  );
}

function CompactRoadPopup({
  locale,
  selectedSegment,
  fairPrice,
}: {
  locale: AppLocale;
  selectedSegment: RoadSegment;
  fairPrice: FairPriceSummary;
}) {
  const t = uiCopy[locale];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <InfoMetricCompact label={t.score} value={selectedSegment.riskScore.toString()} />
        <InfoMetricCompact label={t.fairPrice} value={fairPrice ? formatPrice(fairPrice.currency, fairPrice.avgPrice, locale) : t.pricePending} />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-[0.95rem] border border-[#93c5fd]/14 bg-white/8 px-3 py-2 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/42">{t.type}</p>
          <p className="mt-1 text-[12px] font-medium text-white">{selectedSegment.topCategories[0]}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/42">{t.reports}</p>
          <p className="mt-1 text-[12px] font-medium text-white">{selectedSegment.recentReportCount}</p>
        </div>
      </div>
    </div>
  );
}

function InsightPanel({
  city,
  locale,
  fairPrice,
  selectedSegment,
  reviewSignals,
  getCategoryLabel,
}: {
  city: CityData;
  locale: AppLocale;
  fairPrice: FairPriceSummary;
  selectedSegment: RoadSegment;
  reviewSignals: Array<{ title: string; place: string; summary: string; score: number }>;
  getCategoryLabel: (category: string) => string;
}) {
  const t = uiCopy[locale];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InfoMetricCompact label={t.score} value={selectedSegment.riskScore.toString()} />
        <InfoMetricCompact label={t.judgement} value={riskCopy[locale][selectedSegment.riskLevel]} />
        <InfoMetricCompact label={t.reports} value={`${selectedSegment.recentReportCount}`} />
        <InfoMetricCompact label={t.fairPrice} value={fairPrice ? formatPrice(fairPrice.currency, fairPrice.avgPrice, locale) : t.pricePending} />
      </div>

      <div className="rounded-[1rem] border border-[#93c5fd]/14 bg-white/8 px-3 py-2.5 text-xs leading-5 text-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-white">{locale === "ko" ? selectedSegment.name : selectedSegment.nameEn}</span>
          <span className="text-white/46">{locale === "ko" ? city.label : city.labelEn}</span>
        </div>
        <p className="mt-2">{locale === "ko" ? selectedSegment.summary : selectedSegment.summaryEn}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedSegment.topCategories.map((category) => (
            <span key={category} className="rounded-full border border-[#93c5fd]/14 bg-white/8 px-2 py-1 text-[10px] text-white/78">
              {getCategoryLabel(category)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[#bfdbfe]">{fairPrice ? `${t.storesNearby} · ${fairPrice.note}` : t.pricePending}</p>
      </div>

      <div className="space-y-2">
        {reviewSignals.map((signal, index) => (
          <div key={`${signal.place}-${index}`} className="rounded-[1rem] border border-[#93c5fd]/14 bg-white/8 px-3 py-2.5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/42">{t.reviewSignal}</p>
                <p className="mt-1 text-sm font-medium text-white">{signal.title}</p>
              </div>
              <span className="rounded-full bg-[#dbeafe] px-2 py-1 text-[10px] font-semibold text-[#0f172a]">{signal.score}</span>
            </div>
            <p className="mt-2 text-[11px] text-[#bfdbfe]">{signal.place}</p>
            <p className="mt-1 text-xs leading-5 text-white/68">{signal.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoMetricCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.95rem] border border-[#93c5fd]/14 bg-white/8 px-2.5 py-2 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/46">{label}</p>
      <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-4 text-white">{value}</p>
    </div>
  );
}

function ReportPanel({
  city,
  locale,
  reportState,
  selectedSegment,
  onSubmit,
  compact = false,
}: {
  city: CityData;
  locale: AppLocale;
  reportState: {
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  };
  selectedSegment: RoadSegment;
  onSubmit: (formData: FormData) => Promise<void>;
  compact?: boolean;
}) {
  const t = uiCopy[locale];
  const categories = locale === "ko" ? categoryLabelMap : categoryLabelMapEn;
  const times = locale === "ko" ? timeBucketLabelMap : timeBucketLabelMapEn;
  const travelers = locale === "ko" ? travelerTypeLabelMap : travelerTypeLabelMapEn;
  return (
    <section className="space-y-3">
      <div className={`rounded-[1rem] border border-[#93c5fd]/14 bg-white/8 backdrop-blur-xl ${compact ? "p-3" : "p-4"}`}>
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/46">{t.selectSegment}</p>
        <p className="mt-2 text-sm font-semibold">{locale === "ko" ? selectedSegment.name : selectedSegment.nameEn}</p>
        <p className="mt-1 text-xs text-white/60">{locale === "ko" ? city.label : city.labelEn}</p>
      </div>
      <form action={onSubmit} className="space-y-3">
        <input type="hidden" name="segmentId" value={selectedSegment.id} />
        <label className="block space-y-2">
          <span className="text-xs font-medium text-white/82">{t.reportType}</span>
          <select name="category" defaultValue={selectedSegment.topCategories[0]} className="w-full rounded-2xl border border-[#93c5fd]/14 bg-white/8 px-3 py-2.5 text-sm text-white outline-none backdrop-blur-xl focus:border-[#93c5fd]/36">
            {Object.entries(categories).map(([category, label]) => (
              <option key={category} value={category} className="text-stone-950">
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-xs font-medium text-white/82">{t.incidentTime}</span>
            <select name="incidentTimeBucket" defaultValue="Evening" className="w-full rounded-2xl border border-[#93c5fd]/14 bg-white/8 px-3 py-2.5 text-sm text-white outline-none backdrop-blur-xl focus:border-[#93c5fd]/36">
              {Object.entries(times).map(([value, label]) => (
                <option key={value} value={value} className="text-stone-950">
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-white/82">{t.travelerType}</span>
            <select name="travelerType" defaultValue="Solo traveler" className="w-full rounded-2xl border border-[#93c5fd]/14 bg-white/8 px-3 py-2.5 text-sm text-white outline-none backdrop-blur-xl focus:border-[#93c5fd]/36">
              {Object.entries(travelers).map(([value, label]) => (
                <option key={value} value={value} className="text-stone-950">
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-2">
          <span className="text-xs font-medium text-white/82">{t.note}</span>
          <textarea name="note" rows={compact ? 3 : 4} placeholder={t.notePlaceholder} className="w-full rounded-[1.1rem] border border-[#93c5fd]/14 bg-white/8 px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-white/34 backdrop-blur-xl focus:border-[#93c5fd]/36" />
        </label>
        <button type="submit" disabled={reportState.status === "submitting"} className="w-full rounded-full bg-[#dbeafe] px-5 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#bfdbfe] disabled:cursor-not-allowed disabled:opacity-70">
          {reportState.status === "submitting" ? t.reportSubmitting : t.reportSubmit}
        </button>
        {reportState.status !== "idle" ? (
          <p className={`rounded-2xl px-4 py-3 text-sm ${reportState.status === "success" ? "bg-[#163d35] text-[#d4f1e6]" : reportState.status === "error" ? "bg-[#4c1f1a] text-[#ffd6cf]" : "bg-white/10 text-white/72"}`}>
            {reportState.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}

