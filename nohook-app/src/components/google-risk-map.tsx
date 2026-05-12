"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { riskPalette } from "@/lib/data";
import type { CityData, LatLngPoint } from "@/lib/types";

type RiskMapProps = {
  city: CityData;
  selectedSegmentId: string;
  onSelectSegment: (id: string) => void;
};

type LineFeature = GeoJSON.Feature<GeoJSON.LineString, {
  id: string;
  riskLevel: keyof typeof riskPalette;
  selected: boolean;
}>;

type PointFeature = GeoJSON.Feature<GeoJSON.Point, { label: string }>;

const FALLBACK_WIDTH = 1280;
const FALLBACK_HEIGHT = 880;

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    imagery: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
    labels: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri",
    },
  },
  layers: [
    {
      id: "imagery",
      type: "raster",
      source: "imagery",
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: "labels",
      type: "raster",
      source: "labels",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-opacity": 0.9,
      },
    },
  ],
};

export function GoogleRiskMap({
  city,
  selectedSegmentId,
  onSelectSegment,
}: RiskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [city.mapCenter.lng, city.mapCenter.lat],
      zoom: city.zoom,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");

    map.on("load", () => {
      setLoadState("ready");
    });

    map.on("click", "segment-lines", (event) => {
      const feature = event.features?.[0];
      const segmentId =
        feature && "properties" in feature ? String(feature.properties?.id ?? "") : "";

      if (segmentId) {
        onSelectSegment(segmentId);
      }
    });

    map.on("mouseenter", "segment-lines", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "segment-lines", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("error", (event) => {
      if (!event.error) {
        return;
      }
      setLoadState("error");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [city.id, city.mapCenter.lat, city.mapCenter.lng, city.zoom, onSelectSegment]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !map.isStyleLoaded()) {
      return;
    }

    const lineFeatures: LineFeature[] = city.segments.map((segment) => ({
      type: "Feature",
      properties: {
        id: segment.id,
        riskLevel: segment.riskLevel,
        selected: segment.id === selectedSegmentId,
      },
      geometry: {
        type: "LineString",
        coordinates: segment.path.map((point) => [point.lng, point.lat]),
      },
    }));

    const pointFeatures: PointFeature[] = city.landmarks.map((landmark) => ({
      type: "Feature",
      properties: { label: landmark.label },
      geometry: {
        type: "Point",
        coordinates: [landmark.position.lng, landmark.position.lat],
      },
    }));

    const lineData = {
      type: "FeatureCollection" as const,
      features: lineFeatures,
    };

    const pointData = {
      type: "FeatureCollection" as const,
      features: pointFeatures,
    };

    const lineSource = map.getSource("segments") as GeoJSONSource | undefined;
    const landmarkSource = map.getSource("landmarks") as GeoJSONSource | undefined;

    if (lineSource) {
      lineSource.setData(lineData);
    } else {
      map.addSource("segments", {
        type: "geojson",
        data: lineData,
      });

      map.addLayer({
        id: "segment-glow",
        type: "line",
        source: "segments",
        paint: {
          "line-color": [
            "match",
            ["get", "riskLevel"],
            "Green",
            riskPalette.Green,
            "Yellow",
            riskPalette.Yellow,
            "Orange",
            riskPalette.Orange,
            riskPalette.Red,
          ],
          "line-width": [
            "case",
            ["boolean", ["get", "selected"], false],
            16,
            12,
          ],
          "line-opacity": 0.18,
        },
      });

      map.addLayer({
        id: "segment-lines",
        type: "line",
        source: "segments",
        paint: {
          "line-color": [
            "match",
            ["get", "riskLevel"],
            "Green",
            riskPalette.Green,
            "Yellow",
            riskPalette.Yellow,
            "Orange",
            riskPalette.Orange,
            riskPalette.Red,
          ],
          "line-width": [
            "case",
            ["boolean", ["get", "selected"], false],
            10,
            7,
          ],
          "line-opacity": [
            "case",
            ["boolean", ["get", "selected"], false],
            1,
            0.88,
          ],
        },
      });
    }

    if (landmarkSource) {
      landmarkSource.setData(pointData);
    } else {
      map.addSource("landmarks", {
        type: "geojson",
        data: pointData,
      });

      map.addLayer({
        id: "landmark-points",
        type: "circle",
        source: "landmarks",
        paint: {
          "circle-radius": 5,
          "circle-color": "#f8fafc",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0f172a",
        },
      });
    }

    const bounds = new maplibregl.LngLatBounds();
    city.segments.forEach((segment) => {
      segment.path.forEach((point) => bounds.extend([point.lng, point.lat]));
    });
    city.landmarks.forEach((landmark) =>
      bounds.extend([landmark.position.lng, landmark.position.lat]),
    );

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 88,
        duration: 800,
      });
    }
  }, [city.landmarks, city.segments, selectedSegmentId]);

  const statusLabel =
    loadState === "loading"
      ? "위성 지도를 불러오는 중"
      : loadState === "error"
        ? "위성 타일 로딩에 실패해 데모 지도로 전환됨"
        : "MapLibre 위성 타일 사용 중";

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-300 ${
          loadState === "error" ? "opacity-0" : "opacity-100"
        }`}
      />

      {loadState === "error" ? (
        <FallbackSatelliteMap
          city={city}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
        />
      ) : null}

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/65 px-4 py-2 text-xs text-white/90 backdrop-blur-md">
        {statusLabel}
      </div>
    </div>
  );
}

function FallbackSatelliteMap({
  city,
  selectedSegmentId,
  onSelectSegment,
}: RiskMapProps) {
  const projected = useMemo(() => projectCity(city), [city]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#10161d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,111,78,0.45),transparent_20%),radial-gradient(circle_at_72%_28%,rgba(96,87,62,0.32),transparent_18%),radial-gradient(circle_at_58%_76%,rgba(58,85,68,0.42),transparent_22%),linear-gradient(180deg,#0d1319_0%,#161f29_100%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:120px_120px]" />

      <svg
        viewBox={`0 0 ${FALLBACK_WIDTH} ${FALLBACK_HEIGHT}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`${city.label} 데모 위성 지도`}
      >
        <rect width={FALLBACK_WIDTH} height={FALLBACK_HEIGHT} fill="#101720" />

        {projected.landMasses.map((mass, index) => (
          <path key={`mass-${index}`} d={mass.d} fill={mass.fill} opacity={mass.opacity} />
        ))}

        {projected.roadBeds.map((road, index) => (
          <path
            key={`roadbed-${index}`}
            d={road}
            fill="none"
            stroke="#5f6770"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.62"
          />
        ))}

        {projected.roadBeds.map((road, index) => (
          <path
            key={`roadline-${index}`}
            d={road}
            fill="none"
            stroke="#c3b7a1"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.72"
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
                strokeWidth={isSelected ? 18 : 14}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.12"
              />
              <path
                d={segment.path}
                fill="none"
                stroke={riskPalette[segment.riskLevel]}
                strokeWidth={isSelected ? 11 : 8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isSelected ? 1 : 0.88}
                className="cursor-pointer"
                onClick={() => onSelectSegment(segment.id)}
              />
            </g>
          );
        })}

        {projected.landmarks.map((landmark) => (
          <g key={landmark.label}>
            <circle cx={landmark.x} cy={landmark.y} r="6" fill="#f8fafc" opacity="0.95" />
            <text
              x={landmark.x + 12}
              y={landmark.y + 4}
              fill="#f8fafc"
              fontSize="22"
              fontWeight="600"
              opacity="0.92"
            >
              {landmark.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/82 backdrop-blur-md">
        Satellite Demo
      </div>
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
    const y = paddingY + (1 - (point.lat - minLat) / latRange) * usableHeight;
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

  return {
    segmentPaths,
    landmarks,
    roadBeds: buildRoadBeds(landmarks),
    landMasses: buildLandMasses(landmarks),
  };
}

function buildRoadBeds(landmarks: Array<{ label: string; x: number; y: number }>) {
  if (landmarks.length < 3) {
    return [];
  }

  const [a, b, c] = landmarks;

  return [
    `M ${a.x - 220} ${a.y - 120} C ${a.x - 50} ${a.y - 74}, ${b.x - 140} ${
      b.y - 28
    }, ${b.x + 96} ${b.y + 20}`,
    `M ${a.x - 140} ${a.y + 136} C ${a.x + 36} ${a.y + 72}, ${c.x - 70} ${
      c.y - 14
    }, ${c.x + 180} ${c.y - 58}`,
    `M ${b.x - 170} ${b.y + 160} C ${b.x - 12} ${b.y + 88}, ${c.x + 8} ${
      c.y + 24
    }, ${c.x + 156} ${c.y + 44}`,
    `M ${FALLBACK_WIDTH - 260} 120 C ${FALLBACK_WIDTH - 174} 228, ${
      FALLBACK_WIDTH - 150
    } 306, ${FALLBACK_WIDTH - 68} 436`,
    `M 60 ${FALLBACK_HEIGHT - 170} C 240 ${FALLBACK_HEIGHT - 240}, 440 ${
      FALLBACK_HEIGHT - 192
    }, 620 ${FALLBACK_HEIGHT - 254}`,
  ];
}

function buildLandMasses(
  landmarks: Array<{ label: string; x: number; y: number }>,
) {
  if (landmarks.length < 3) {
    return [];
  }

  const [a, b, c] = landmarks;

  return [
    {
      d: "M 0 0 H 360 C 298 76, 270 132, 206 168 C 144 204, 74 194, 0 148 Z",
      fill: "#2c4432",
      opacity: 0.7,
    },
    {
      d: `M ${FALLBACK_WIDTH - 320} 0 H ${FALLBACK_WIDTH} V 260 C ${
        FALLBACK_WIDTH - 74
      } 220, ${FALLBACK_WIDTH - 156} 174, ${FALLBACK_WIDTH - 240} 120 C ${
        FALLBACK_WIDTH - 294
      } 84, ${FALLBACK_WIDTH - 308} 36, ${FALLBACK_WIDTH - 320} 0 Z`,
      fill: "#41563c",
      opacity: 0.58,
    },
    {
      d: `M ${a.x - 120} ${a.y + 76} C ${a.x - 28} ${a.y + 12}, ${
        a.x + 112
      } ${a.y + 28}, ${a.x + 122} ${a.y + 118} C ${a.x + 40} ${a.y + 176}, ${
        a.x - 50
      } ${a.y + 152}, ${a.x - 120} ${a.y + 76} Z`,
      fill: "#486245",
      opacity: 0.38,
    },
    {
      d: `M ${b.x - 150} ${b.y - 82} C ${b.x - 48} ${b.y - 138}, ${
        b.x + 84
      } ${b.y - 126}, ${b.x + 124} ${b.y - 16} C ${b.x + 64} ${b.y + 48}, ${
        b.x - 40
      } ${b.y + 52}, ${b.x - 150} ${b.y - 82} Z`,
      fill: "#394f39",
      opacity: 0.38,
    },
    {
      d: `M ${c.x - 74} ${c.y - 120} C ${c.x + 44} ${c.y - 168}, ${
        c.x + 156
      } ${c.y - 82}, ${c.x + 132} ${c.y + 30} C ${c.x + 64} ${c.y + 72}, ${
        c.x - 38
      } ${c.y + 40}, ${c.x - 74} ${c.y - 120} Z`,
      fill: "#4f6b49",
      opacity: 0.34,
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
