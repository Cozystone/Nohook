export type RiskLevel = "Green" | "Yellow" | "Orange" | "Red";

export type AppLocale = "ko" | "en";

export type LatLngPoint = {
  lat: number;
  lng: number;
};

export type PlaceSignal = {
  placeName: string;
  placeNameEn: string;
  signalType: string;
  signalTypeEn: string;
  signalScore: number;
  evidence: string;
  evidenceEn: string;
};

export type RoadSegment = {
  id: string;
  name: string;
  nameEn: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  summaryEn: string;
  topCategories: string[];
  reasons: string[];
  reasonsEn: string[];
  recentReportCount: number;
  path: LatLngPoint[];
  placeSignals: PlaceSignal[];
};

export type CityLandmark = {
  label: string;
  labelEn: string;
  position: LatLngPoint;
};

export type ProductCatalogItem = {
  id: string;
  name: string;
  nameEn: string;
  synonyms: string[];
};

export type StoreItemPrice = {
  productId: string;
  avgPrice: number;
  currency: string;
  note: string;
  noteEn: string;
};

export type StoreListing = {
  id: string;
  name: string;
  nameEn: string;
  segmentId: string;
  position: LatLngPoint;
  items: StoreItemPrice[];
};

export type ShopCorridorLevel = "Low" | "Medium" | "High";

export type ShopCorridor = {
  id: string;
  name: string;
  nameEn: string;
  level: ShopCorridorLevel;
  storeCount: number;
  path: LatLngPoint[];
};

export type CityData = {
  id: string;
  shortLabel: string;
  shortLabelEn: string;
  label: string;
  labelEn: string;
  subtitle: string;
  subtitleEn: string;
  mapCenter: LatLngPoint;
  zoom: number;
  landmarks: CityLandmark[];
  segments: RoadSegment[];
  shopCorridors: ShopCorridor[];
  storeListings: StoreListing[];
};

export type ReportPayload = {
  cityId: string;
  segmentId: string;
  category: string;
  incidentTimeBucket: string;
  travelerType: string;
  note: string;
};

export type ReportSubmissionResult = {
  ok: boolean;
  message: string;
  moderationStatus: "received" | "under_review";
  reportReference: string;
};

export type GeoDbCitySuggestion = {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  supportedCityId?: string;
};
