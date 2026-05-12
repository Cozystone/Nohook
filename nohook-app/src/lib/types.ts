export type RiskLevel = "Green" | "Yellow" | "Orange" | "Red";

export type LatLngPoint = {
  lat: number;
  lng: number;
};

export type PlaceSignal = {
  placeName: string;
  signalType: string;
  signalScore: number;
  evidence: string;
};

export type RoadSegment = {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  topCategories: string[];
  reasons: string[];
  recentReportCount: number;
  path: LatLngPoint[];
  placeSignals: PlaceSignal[];
};

export type CityLandmark = {
  label: string;
  position: LatLngPoint;
};

export type CityData = {
  id: string;
  shortLabel: string;
  label: string;
  subtitle: string;
  mapCenter: LatLngPoint;
  zoom: number;
  landmarks: CityLandmark[];
  segments: RoadSegment[];
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
