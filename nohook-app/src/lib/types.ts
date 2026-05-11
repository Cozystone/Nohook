export type RiskLevel = "Green" | "Yellow" | "Orange" | "Red";

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
  mapPath: string;
  placeSignals: PlaceSignal[];
};

export type CityLandmark = {
  label: string;
  x: number;
  y: number;
};

export type CityData = {
  id: string;
  shortLabel: string;
  label: string;
  subtitle: string;
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
