"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import "leaflet/dist/leaflet.css";
import type * as LeafletType from "leaflet";
import {
  formatPrice,
  getStoreProductPrice,
  riskPalette,
  shopCorridorPalette,
} from "@/lib/data";
import type { AppLocale, CityData, LatLngPoint, ShopCorridor } from "@/lib/types";

type RiskMapProps = {
  city: CityData;
  selectedSegmentId: string;
  selectedProductId?: string;
  locale: AppLocale;
  onSelectSegment: (id: string) => void;
  onZoomLevelChange?: (zoom: number) => void;
};

export type RiskMapHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
};

const FALLBACK_WIDTH = 1280;
const FALLBACK_HEIGHT = 880;
const PRICE_ZOOM_THRESHOLD = 17;
const SHOP_CORRIDOR_ZOOM_THRESHOLD = 16;

export const GoogleRiskMap = forwardRef<RiskMapHandle, RiskMapProps>(
  function GoogleRiskMap(
    { city, selectedSegmentId, selectedProductId, locale, onSelectSegment, onZoomLevelChange },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletType.Map | null>(null);
    const segmentLayersRef = useRef<Map<string, LeafletType.Layer>>(new Map());
    const markerLayerRef = useRef<LeafletType.LayerGroup | null>(null);
    const priceLayerRef = useRef<LeafletType.LayerGroup | null>(null);
    const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
    const [zoomLevel, setZoomLevel] = useState(15);

    useImperativeHandle(ref, () => ({
      zoomIn() {
        mapRef.current?.zoomIn();
      },
      zoomOut() {
        mapRef.current?.zoomOut();
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const segmentLayers = segmentLayersRef.current;
      let map: LeafletType.Map | null = null;

      async function initMap() {
        const L = await import("leaflet");

        map = L.map(containerRef.current!, {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
        });

        mapRef.current = map;
        setZoomLevel(map.getZoom());
        onZoomLevelChange?.(map.getZoom());
        map.on("zoomend", () => {
          const nextZoom = map?.getZoom() ?? 15;
          setZoomLevel(nextZoom);
          onZoomLevelChange?.(nextZoom);
        });

        const imageryLayer = L.tileLayer(
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            opacity: 0.82,
            crossOrigin: true,
          },
        );

        const labelLayer = L.tileLayer(
          "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            opacity: 0.85,
            crossOrigin: true,
          },
        );

        let tileErrors = 0;
        imageryLayer.on("load", () => setLoadState("ready"));
        imageryLayer.on("tileerror", () => {
          tileErrors += 1;
          if (tileErrors > 4) setLoadState("error");
        });

        imageryLayer.addTo(map);
        labelLayer.addTo(map);

        setTimeout(() => {
          map?.invalidateSize();
        }, 0);
      }

      initMap();

      return () => {
        map?.remove();
        mapRef.current = null;
        segmentLayers.clear();
        markerLayerRef.current = null;
        priceLayerRef.current = null;
      };
    }, [onZoomLevelChange]);

    useEffect(() => {
      if (!mapRef.current) return;
      let cancelled = false;

      async function syncLayers() {
        const L = await import("leaflet");
        const leafletMap = mapRef.current;
        if (cancelled || !leafletMap) return;

        segmentLayersRef.current.forEach((layer) => layer.remove());
        segmentLayersRef.current.clear();
        if (markerLayerRef.current) markerLayerRef.current.remove();

        const bounds = L.latLngBounds([]);

        city.segments.forEach((segment) => {
          const isSelected = segment.id === selectedSegmentId;
          const latLngs = segment.path.map((point) => [point.lat, point.lng] as LeafletType.LatLngTuple);

          const glow = L.polyline(latLngs, {
            color: riskPalette[segment.riskLevel],
            weight: isSelected ? 22 : 18,
            opacity: isSelected ? 0.28 : 0.18,
            interactive: false,
          }).addTo(leafletMap);

          const underLine = L.polyline(latLngs, {
            color: "#fff6e4",
            weight: isSelected ? 10 : 8,
            opacity: isSelected ? 0.8 : 0.56,
            interactive: false,
          }).addTo(leafletMap);

          const line = L.polyline(latLngs, {
            color: riskPalette[segment.riskLevel],
            weight: isSelected ? 7 : 6,
            opacity: 1,
          }).addTo(leafletMap);

          line.on("click", () => onSelectSegment(segment.id));
          line.on("mouseover", () => {
            leafletMap.getContainer().style.cursor = "pointer";
          });
          line.on("mouseout", () => {
            leafletMap.getContainer().style.cursor = "";
          });

          segmentLayersRef.current.set(`${segment.id}-glow`, glow);
          segmentLayersRef.current.set(`${segment.id}-under`, underLine);
          segmentLayersRef.current.set(segment.id, line);
          latLngs.forEach((point) => bounds.extend(point));
        });

        const markerLayer = L.layerGroup();
        city.landmarks.forEach((landmark) => {
          const marker = L.circleMarker([landmark.position.lat, landmark.position.lng], {
            radius: 4,
            weight: 2,
            color: "#081018",
            fillColor: "#f8fafc",
            fillOpacity: 0.95,
          }).bindTooltip(locale === "ko" ? landmark.label : landmark.labelEn, {
            permanent: false,
            direction: "top",
            offset: [0, -8],
          });
          marker.addTo(markerLayer);
          bounds.extend([landmark.position.lat, landmark.position.lng]);
        });

        markerLayer.addTo(leafletMap);
        markerLayerRef.current = markerLayer;

        if (bounds.isValid()) {
          leafletMap.fitBounds(bounds, { padding: [44, 44] });
          const nextZoom = leafletMap.getZoom();
          setZoomLevel(nextZoom);
          onZoomLevelChange?.(nextZoom);
        } else {
          leafletMap.setView([city.mapCenter.lat, city.mapCenter.lng], city.zoom);
        }
      }

      syncLayers();
      return () => {
        cancelled = true;
      };
    }, [city, locale, onSelectSegment, onZoomLevelChange, selectedSegmentId]);

    useEffect(() => {
      if (!mapRef.current) return;
      let cancelled = false;

      async function syncShopCorridors() {
        const L = await import("leaflet");
        const leafletMap = mapRef.current;
        if (cancelled || !leafletMap) return;

        Array.from(segmentLayersRef.current.entries())
          .filter(([key]) => key.startsWith("shop-corridor-"))
          .forEach(([key, layer]) => {
            layer.remove();
            segmentLayersRef.current.delete(key);
          });

        if (zoomLevel < SHOP_CORRIDOR_ZOOM_THRESHOLD) return;

        city.shopCorridors.forEach((corridor) => {
          const latLngs = corridor.path.map(
            (point) => [point.lat, point.lng] as LeafletType.LatLngTuple,
          );
          const keyBase = `shop-corridor-${corridor.id}`;
          const halo = L.polyline(latLngs, {
            color: shopCorridorPalette[corridor.level],
            weight: 12,
            opacity: 0.14,
            interactive: false,
          }).addTo(leafletMap);
          const line = L.polyline(latLngs, {
            color: shopCorridorPalette[corridor.level],
            weight: 4,
            opacity: 0.96,
            dashArray: "1 9",
            lineCap: "round",
            interactive: false,
          }).bindTooltip(formatShopCorridorTooltip(corridor, locale), {
            direction: "top",
            offset: [0, -8],
          }).addTo(leafletMap);

          segmentLayersRef.current.set(`${keyBase}-halo`, halo);
          segmentLayersRef.current.set(keyBase, line);
        });
      }

      syncShopCorridors();
      return () => {
        cancelled = true;
      };
    }, [city, locale, zoomLevel]);

    useEffect(() => {
      if (!mapRef.current) return;
      let cancelled = false;

      async function syncPriceMarkers() {
        const L = await import("leaflet");
        const leafletMap = mapRef.current;
        if (cancelled || !leafletMap) return;

        if (priceLayerRef.current) {
          priceLayerRef.current.remove();
          priceLayerRef.current = null;
        }

        if (!selectedProductId || zoomLevel < PRICE_ZOOM_THRESHOLD) return;

        const layerGroup = L.layerGroup();
        city.storeListings.forEach((store) => {
          const price = getStoreProductPrice(store, selectedProductId);
          if (!price) return;

          const html = `<div class="price-pin"><span>${formatPrice(price.currency, price.avgPrice, locale)}</span></div>`;
          const icon = L.divIcon({
            className: "price-pin-wrapper",
            html,
            iconSize: [110, 34],
            iconAnchor: [55, 17],
          });

          const marker = L.marker([store.position.lat, store.position.lng], { icon }).bindTooltip(
            `${locale === "ko" ? store.name : store.nameEn}\n${locale === "ko" ? price.note : price.noteEn}`,
            { direction: "top", offset: [0, -12] },
          );

          marker.addTo(layerGroup);
        });

        layerGroup.addTo(leafletMap);
        priceLayerRef.current = layerGroup;
      }

      syncPriceMarkers();
      return () => {
        cancelled = true;
      };
    }, [city, locale, selectedProductId, zoomLevel]);

    const statusLabel =
      loadState === "loading"
        ? locale === "ko"
          ? "위성 지도를 불러오는 중"
          : "Loading satellite map"
        : loadState === "error"
          ? locale === "ko"
            ? "위성 타일 로딩 실패, 데모 지도로 전환"
            : "Satellite tiles failed, using demo map"
          : selectedProductId && zoomLevel >= PRICE_ZOOM_THRESHOLD
            ? locale === "ko"
              ? "가게별 평균 가격 표시 중"
              : "Showing average prices by shop"
            : zoomLevel >= SHOP_CORRIDOR_ZOOM_THRESHOLD
              ? locale === "ko"
                ? "상점 밀집 거리 레이어 표시 중"
                : "Showing shop-street layer"
            : locale === "ko"
              ? "호객 위험 도로 색상 표시"
              : "Showing tout-risk road colors";

    return (
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={containerRef} className="phone-map absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(7,12,18,0.06)_0%,rgba(7,12,18,0.14)_100%)]" />

        {loadState === "error" ? (
          <FallbackSatelliteMap
            city={city}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={onSelectSegment}
          />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-[linear-gradient(180deg,rgba(6,10,15,0)_0%,rgba(6,10,15,0.55)_100%)]" />
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[11px] text-white/90 backdrop-blur-md">
          {statusLabel}
        </div>
      </div>
    );
  },
);

function formatShopCorridorTooltip(corridor: ShopCorridor, locale: AppLocale) {
  const levelCopy =
    locale === "ko"
      ? corridor.level === "High"
        ? "상점 밀집 높음"
        : corridor.level === "Medium"
          ? "상점 밀집 보통"
          : "상점 밀집 낮음"
      : corridor.level === "High"
        ? "High shop density"
        : corridor.level === "Medium"
          ? "Medium shop density"
          : "Low shop density";

  const streetName = locale === "ko" ? corridor.name : corridor.nameEn;
  const countCopy =
    locale === "ko"
      ? `상점 약 ${corridor.storeCount}곳`
      : `About ${corridor.storeCount} stores`;

  return `${streetName}\n${levelCopy}\n${countCopy}`;
}

function FallbackSatelliteMap({ city, selectedSegmentId, onSelectSegment }: Pick<RiskMapProps, "city" | "selectedSegmentId" | "onSelectSegment">) {
  const projected = useMemo(() => projectCity(city), [city]);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-[#10161d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,111,78,0.45),transparent_20%),radial-gradient(circle_at_72%_28%,rgba(96,87,62,0.32),transparent_18%),radial-gradient(circle_at_58%_76%,rgba(58,85,68,0.42),transparent_22%),linear-gradient(180deg,#0d1319_0%,#161f29_100%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:120px_120px]" />
      <svg viewBox={`0 0 ${FALLBACK_WIDTH} ${FALLBACK_HEIGHT}`} className="absolute inset-0 h-full w-full" role="img" aria-label={`${city.label} demo satellite map`}>
        <rect width={FALLBACK_WIDTH} height={FALLBACK_HEIGHT} fill="#101720" />
        {projected.landMasses.map((mass, index) => <path key={`mass-${index}`} d={mass.d} fill={mass.fill} opacity={mass.opacity} />)}
        {projected.roadBeds.map((road, index) => <path key={`roadbed-${index}`} d={road} fill="none" stroke="#5f6770" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.62" />)}
        {projected.roadBeds.map((road, index) => <path key={`roadline-${index}`} d={road} fill="none" stroke="#c3b7a1" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />)}
        {projected.segmentPaths.map((segment) => {
          const isSelected = segment.id === selectedSegmentId;
          return (
            <g key={segment.id}>
              <path d={segment.path} fill="none" stroke={riskPalette[segment.riskLevel]} strokeWidth={isSelected ? 22 : 18} strokeLinecap="round" strokeLinejoin="round" opacity={isSelected ? 0.3 : 0.18} />
              <path d={segment.path} fill="none" stroke="#fff6e4" strokeWidth={isSelected ? 10 : 8} strokeLinecap="round" strokeLinejoin="round" opacity={isSelected ? 0.8 : 0.56} />
              <path d={segment.path} fill="none" stroke={riskPalette[segment.riskLevel]} strokeWidth={isSelected ? 7 : 6} strokeLinecap="round" strokeLinejoin="round" opacity="1" className="cursor-pointer" onClick={() => onSelectSegment(segment.id)} />
            </g>
          );
        })}
        {projected.landmarks.map((landmark) => (
          <g key={landmark.label}><circle cx={landmark.x} cy={landmark.y} r="6" fill="#f8fafc" opacity="0.95" /><text x={landmark.x + 12} y={landmark.y + 4} fill="#f8fafc" fontSize="22" fontWeight="600" opacity="0.92">{landmark.label}</text></g>
        ))}
      </svg>
    </div>
  );
}

function projectCity(city: CityData) {
  const allPoints: LatLngPoint[] = [city.mapCenter, ...city.landmarks.map((landmark) => landmark.position), ...city.segments.flatMap((segment) => segment.path)];
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
  const landmarks = city.landmarks.map((landmark) => ({ label: landmark.label, ...project(landmark.position) }));
  const segmentPaths = city.segments.map((segment) => ({ id: segment.id, riskLevel: segment.riskLevel, path: toSmoothPath(segment.path.map(project)) }));
  return { segmentPaths, landmarks, roadBeds: buildRoadBeds(landmarks), landMasses: buildLandMasses(landmarks) };
}

function buildRoadBeds(landmarks: Array<{ label: string; x: number; y: number }>) {
  if (landmarks.length < 3) return [];
  const [a, b, c] = landmarks;
  return [
    `M ${a.x - 220} ${a.y - 120} C ${a.x - 50} ${a.y - 74}, ${b.x - 140} ${b.y - 28}, ${b.x + 96} ${b.y + 20}`,
    `M ${a.x - 140} ${a.y + 136} C ${a.x + 36} ${a.y + 72}, ${c.x - 70} ${c.y - 14}, ${c.x + 180} ${c.y - 58}`,
    `M ${b.x - 170} ${b.y + 160} C ${b.x - 12} ${b.y + 88}, ${c.x + 8} ${c.y + 24}, ${c.x + 156} ${c.y + 44}`,
    `M ${FALLBACK_WIDTH - 260} 120 C ${FALLBACK_WIDTH - 174} 228, ${FALLBACK_WIDTH - 150} 306, ${FALLBACK_WIDTH - 68} 436`,
    `M 60 ${FALLBACK_HEIGHT - 170} C 240 ${FALLBACK_HEIGHT - 240}, 440 ${FALLBACK_HEIGHT - 192}, 620 ${FALLBACK_HEIGHT - 254}`,
  ];
}

function buildLandMasses(landmarks: Array<{ label: string; x: number; y: number }>) {
  if (landmarks.length < 3) return [];
  const [a, b, c] = landmarks;
  return [
    { d: "M 0 0 H 360 C 298 76, 270 132, 206 168 C 144 204, 74 194, 0 148 Z", fill: "#2c4432", opacity: 0.7 },
    { d: `M ${FALLBACK_WIDTH - 320} 0 H ${FALLBACK_WIDTH} V 260 C ${FALLBACK_WIDTH - 74} 220, ${FALLBACK_WIDTH - 156} 174, ${FALLBACK_WIDTH - 240} 120 C ${FALLBACK_WIDTH - 294} 84, ${FALLBACK_WIDTH - 308} 36, ${FALLBACK_WIDTH - 320} 0 Z`, fill: "#41563c", opacity: 0.58 },
    { d: `M ${a.x - 120} ${a.y + 76} C ${a.x - 28} ${a.y + 12}, ${a.x + 112} ${a.y + 28}, ${a.x + 122} ${a.y + 118} C ${a.x + 40} ${a.y + 176}, ${a.x - 50} ${a.y + 152}, ${a.x - 120} ${a.y + 76} Z`, fill: "#486245", opacity: 0.38 },
    { d: `M ${b.x - 150} ${b.y - 82} C ${b.x - 48} ${b.y - 138}, ${b.x + 84} ${b.y - 126}, ${b.x + 124} ${b.y - 16} C ${b.x + 64} ${b.y + 48}, ${b.x - 40} ${b.y + 52}, ${b.x - 150} ${b.y - 82} Z`, fill: "#394f39", opacity: 0.38 },
    { d: `M ${c.x - 74} ${c.y - 120} C ${c.x + 44} ${c.y - 168}, ${c.x + 156} ${c.y - 82}, ${c.x + 132} ${c.y + 30} C ${c.x + 64} ${c.y + 72}, ${c.x - 38} ${c.y + 40}, ${c.x - 74} ${c.y - 120} Z`, fill: "#4f6b49", opacity: 0.34 },
  ];
}

function toSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
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
