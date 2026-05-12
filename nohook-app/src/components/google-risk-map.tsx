"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { riskPalette } from "@/lib/data";
import type { CityData, LatLngPoint } from "@/lib/types";

type GoogleRiskMapProps = {
  city: CityData;
  selectedSegmentId: string;
  onSelectSegment: (id: string) => void;
};

const FALLBACK_WIDTH = 1280;
const FALLBACK_HEIGHT = 880;

export function GoogleRiskMap({
  city,
  selectedSegmentId,
  onSelectSegment,
}: GoogleRiskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const segmentLinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const labelMarkersRef = useRef<google.maps.Marker[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "ready" | "error" | "missing-key"
  >(apiKey ? "idle" : "missing-key");

  useEffect(() => {
    if (!apiKey || !containerRef.current) {
      return;
    }

    let active = true;
    const segmentLines = segmentLinesRef.current;
    const labelMarkers = labelMarkersRef.current;

    async function loadMap() {
      try {
        setLoadState("loading");

        const { setOptions, importLibrary } = await import(
          "@googlemaps/js-api-loader"
        );
        setOptions({
          key: apiKey,
          v: "weekly",
          language: "ko",
          region: "KR",
        });
        await importLibrary("maps");

        if (!active || !containerRef.current) {
          return;
        }

        mapRef.current = new google.maps.Map(containerRef.current, {
          center: city.mapCenter,
          zoom: city.zoom,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ["roadmap", "satellite"],
          },
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeId: "satellite",
        });

        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    loadMap();

    return () => {
      active = false;
      segmentLines.forEach((polyline) => polyline.setMap(null));
      segmentLines.clear();
      labelMarkers.forEach((marker) => marker.setMap(null));
      labelMarkersRef.current = [];
    };
  }, [apiKey, city.id, city.mapCenter, city.zoom]);

  useEffect(() => {
    if (!mapRef.current || loadState !== "ready") {
      return;
    }

    segmentLinesRef.current.forEach((polyline) => polyline.setMap(null));
    segmentLinesRef.current.clear();
    labelMarkersRef.current.forEach((marker) => marker.setMap(null));
    labelMarkersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    city.segments.forEach((segment) => {
      const isSelected = segment.id === selectedSegmentId;
      const polyline = new google.maps.Polyline({
        map: mapRef.current!,
        path: segment.path,
        geodesic: true,
        strokeColor: riskPalette[segment.riskLevel],
        strokeOpacity: isSelected ? 1 : 0.84,
        strokeWeight: isSelected ? 10 : 7,
        zIndex: isSelected ? 30 : 20,
      });

      polyline.addListener("click", () => onSelectSegment(segment.id));

      segment.path.forEach((point) => bounds.extend(point));
      segmentLinesRef.current.set(segment.id, polyline);
    });

    city.landmarks.forEach((landmark) => {
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: landmark.position,
        title: landmark.label,
        label: {
          text: landmark.label,
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#103534",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 6,
        },
      });

      labelMarkersRef.current.push(marker);
      bounds.extend(landmark.position);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, 96);
    }
  }, [city, loadState, onSelectSegment, selectedSegmentId]);

  useEffect(() => {
    if (!mapRef.current || loadState !== "ready") {
      return;
    }

    city.segments.forEach((segment) => {
      const polyline = segmentLinesRef.current.get(segment.id);
      const isSelected = segment.id === selectedSegmentId;

      if (!polyline) {
        return;
      }

      polyline.setOptions({
        strokeOpacity: isSelected ? 1 : 0.84,
        strokeWeight: isSelected ? 10 : 7,
        zIndex: isSelected ? 30 : 20,
      });
    });
  }, [city.segments, loadState, selectedSegmentId]);

  return (
    <div className="absolute inset-0">
      {loadState === "ready" ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <FallbackSatelliteMap
          city={city}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
          status={loadState}
        />
      )}

      {loadState === "loading" ? (
        <MapStatusPill label="Google 위성 지도를 불러오는 중" />
      ) : null}
      {loadState === "missing-key" ? (
        <MapStatusPill label="위성 데모 지도 표시 중 · API 키 미설정" />
      ) : null}
      {loadState === "error" ? (
        <MapStatusPill label="위성 데모 지도 표시 중 · 지도 로드 실패" />
      ) : null}
    </div>
  );
}

function FallbackSatelliteMap({
  city,
  selectedSegmentId,
  onSelectSegment,
  status,
}: {
  city: CityData;
  selectedSegmentId: string;
  onSelectSegment: (id: string) => void;
  status: "idle" | "loading" | "ready" | "error" | "missing-key";
}) {
  const projected = useMemo(() => projectCity(city), [city]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#101722]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(94,120,86,0.48),transparent_18%),radial-gradient(circle_at_76%_28%,rgba(120,118,80,0.36),transparent_18%),radial-gradient(circle_at_58%_72%,rgba(72,95,70,0.42),transparent_20%),linear-gradient(180deg,#0b1016_0%,#131d28_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:120px_120px]" />

      <svg
        viewBox={`0 0 ${FALLBACK_WIDTH} ${FALLBACK_HEIGHT}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`${city.label} 위성 데모 지도`}
      >
        <rect width={FALLBACK_WIDTH} height={FALLBACK_HEIGHT} fill="#0c131a" />

        {projected.greenMasses.map((block, index) => (
          <path
            key={`mass-${index}`}
            d={block.d}
            fill={block.fill}
            opacity={block.opacity}
          />
        ))}

        {projected.roadBeds.map((road, index) => (
          <path
            key={`roadbed-${index}`}
            d={road}
            fill="none"
            stroke="#6d747c"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.68"
          />
        ))}

        {projected.roadBeds.map((road, index) => (
          <path
            key={`roadcore-${index}`}
            d={road}
            fill="none"
            stroke="#c8c3b3"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.78"
          />
        ))}

        {projected.segmentPaths.map((segment) => {
          const isSelected = segment.id === selectedSegmentId;

          return (
            <g key={segment.id}>
              <path
                d={segment.path}
                fill="none"
                stroke="#ffffff"
                strokeWidth={isSelected ? 22 : 18}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.12"
              />
              <path
                d={segment.path}
                fill="none"
                stroke={riskPalette[segment.riskLevel]}
                strokeWidth={isSelected ? 14 : 11}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isSelected ? 1 : 0.86}
                className="cursor-pointer"
                onClick={() => onSelectSegment(segment.id)}
              />
            </g>
          );
        })}

        {projected.landmarks.map((landmark) => (
          <g key={landmark.label}>
            <circle
              cx={landmark.x}
              cy={landmark.y}
              r="8"
              fill="#e9f3f0"
              fillOpacity="0.94"
            />
            <circle cx={landmark.x} cy={landmark.y} r="4" fill="#103534" />
            <rect
              x={landmark.x + 14}
              y={landmark.y - 17}
              width={Math.max(82, landmark.label.length * 8)}
              height="26"
              rx="13"
              fill="rgba(5,8,13,0.78)"
              stroke="rgba(255,255,255,0.12)"
            />
            <text
              x={landmark.x + 28}
              y={landmark.y}
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              dominantBaseline="middle"
            >
              {landmark.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <MapChromePill label="Satellite Demo" />
        <MapChromePill
          label={status === "missing-key" ? "발표용 데모 뷰" : "대체 위성 렌더링"}
        />
      </div>

      <div className="absolute right-4 top-16 flex flex-col gap-2">
        <FakeControlButton label="+" />
        <FakeControlButton label="−" />
      </div>
    </div>
  );
}

function MapChromePill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-black/38 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/82 backdrop-blur-md">
      {label}
    </div>
  );
}

function FakeControlButton({ label }: { label: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-black/42 text-lg font-semibold text-white/90 backdrop-blur-md">
      {label}
    </div>
  );
}

function MapStatusPill({ label }: { label: string }) {
  return (
    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/42 px-4 py-2 text-xs text-white/86 backdrop-blur-md">
      {label}
    </div>
  );
}

function projectCity(city: CityData) {
  const allPoints: LatLngPoint[] = [
    city.mapCenter,
    ...city.landmarks.map((landmark) => landmark.position),
    ...city.segments.flatMap((segment) => segment.path),
  ];

  const minLat = Math.min(...allPoints.map((point) => point.lat));
  const maxLat = Math.max(...allPoints.map((point) => point.lat));
  const minLng = Math.min(...allPoints.map((point) => point.lng));
  const maxLng = Math.max(...allPoints.map((point) => point.lng));
  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  const paddingX = 160;
  const paddingY = 110;
  const usableWidth = FALLBACK_WIDTH - paddingX * 2;
  const usableHeight = FALLBACK_HEIGHT - paddingY * 2;

  function project(point: LatLngPoint) {
    const x = paddingX + ((point.lng - minLng) / lngRange) * usableWidth;
    const y =
      paddingY + (1 - (point.lat - minLat) / latRange) * usableHeight;

    return { x, y };
  }

  const landmarks = city.landmarks.map((landmark) => ({
    label: landmark.label,
    ...project(landmark.position),
  }));

  const segmentPaths = city.segments.map((segment) => ({
    id: segment.id,
    riskLevel: segment.riskLevel,
    path: toSmoothPath(segment.path.map(project)),
  }));

  const roadBeds = buildRoadBeds(landmarks);
  const greenMasses = buildGreenMasses(landmarks);

  return { landmarks, segmentPaths, roadBeds, greenMasses };
}

function buildRoadBeds(landmarks: Array<{ label: string; x: number; y: number }>) {
  if (landmarks.length < 3) {
    return [];
  }

  const [a, b, c] = landmarks;

  return [
    `M ${a.x - 220} ${a.y - 120} C ${a.x - 60} ${a.y - 70}, ${b.x - 120} ${
      b.y - 30
    }, ${b.x + 90} ${b.y + 10}`,
    `M ${a.x - 150} ${a.y + 120} C ${a.x + 30} ${a.y + 56}, ${c.x - 80} ${
      c.y - 10
    }, ${c.x + 180} ${c.y - 60}`,
    `M ${b.x - 140} ${b.y + 160} C ${b.x - 10} ${b.y + 84}, ${c.x - 10} ${
      c.y + 26
    }, ${c.x + 150} ${c.y + 44}`,
    `M ${FALLBACK_WIDTH - 260} 120 C ${FALLBACK_WIDTH - 170} 220, ${
      FALLBACK_WIDTH - 150
    } 300, ${FALLBACK_WIDTH - 70} 430`,
    `M 60 ${FALLBACK_HEIGHT - 180} C 230 ${FALLBACK_HEIGHT - 240}, 420 ${
      FALLBACK_HEIGHT - 180
    }, 620 ${FALLBACK_HEIGHT - 250}`,
  ];
}

function buildGreenMasses(
  landmarks: Array<{ label: string; x: number; y: number }>,
) {
  if (landmarks.length < 3) {
    return [];
  }

  const [a, b, c] = landmarks;

  return [
    {
      d: `M 0 0 H 360 C 310 70, 280 120, 220 160 C 150 205, 80 190, 0 150 Z`,
      fill: "#294130",
      opacity: 0.7,
    },
    {
      d: `M ${FALLBACK_WIDTH - 320} 0 H ${FALLBACK_WIDTH} V 250 C ${
        FALLBACK_WIDTH - 70
      } 220, ${FALLBACK_WIDTH - 150} 170, ${FALLBACK_WIDTH - 240} 110 C ${
        FALLBACK_WIDTH - 290
      } 70, ${FALLBACK_WIDTH - 308} 34, ${FALLBACK_WIDTH - 320} 0 Z`,
      fill: "#3b5236",
      opacity: 0.62,
    },
    {
      d: `M ${a.x - 120} ${a.y + 70} C ${a.x - 30} ${a.y + 10}, ${
        a.x + 110
      } ${a.y + 20}, ${a.x + 120} ${a.y + 115} C ${a.x + 40} ${a.y + 162}, ${
        a.x - 54
      } ${a.y + 150}, ${a.x - 120} ${a.y + 70} Z`,
      fill: "#40593c",
      opacity: 0.42,
    },
    {
      d: `M ${b.x - 150} ${b.y - 70} C ${b.x - 50} ${b.y - 130}, ${
        b.x + 80
      } ${b.y - 120}, ${b.x + 120} ${b.y - 20} C ${b.x + 60} ${b.y + 36}, ${
        b.x - 40
      } ${b.y + 48}, ${b.x - 150} ${b.y - 70} Z`,
      fill: "#344a34",
      opacity: 0.4,
    },
    {
      d: `M ${c.x - 70} ${c.y - 120} C ${c.x + 50} ${c.y - 160}, ${
        c.x + 150
      } ${c.y - 84}, ${c.x + 130} ${c.y + 24} C ${c.x + 70} ${c.y + 70}, ${
        c.x - 40
      } ${c.y + 40}, ${c.x - 70} ${c.y - 120} Z`,
      fill: "#445d42",
      opacity: 0.38,
    },
    {
      d: `M 0 ${FALLBACK_HEIGHT - 210} C 130 ${FALLBACK_HEIGHT - 260}, 280 ${
        FALLBACK_HEIGHT - 180
      }, 380 ${FALLBACK_HEIGHT} H 0 Z`,
      fill: "#253a2c",
      opacity: 0.56,
    },
  ];
}

function toSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }

  const last = points[points.length - 1];
  path += ` T ${last.x} ${last.y}`;

  return path;
}
