import { findCity, findSegment } from "@/lib/data";
import type { ReportPayload, ReportSubmissionResult } from "@/lib/types";

function isValidPayload(payload: Partial<ReportPayload>) {
  return Boolean(
    payload.cityId &&
      payload.segmentId &&
      payload.category &&
      payload.incidentTimeBucket &&
      payload.travelerType,
  );
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<ReportPayload>;

  if (!isValidPayload(payload)) {
    return Response.json(
      { ok: false, message: "Missing required report fields" },
      { status: 400 },
    );
  }

  const city = findCity(payload.cityId!);
  const segment = findSegment(payload.segmentId!);

  if (!city || !segment) {
    return Response.json(
      { ok: false, message: "Invalid city or segment" },
      { status: 404 },
    );
  }

  const result: ReportSubmissionResult = {
    ok: true,
    message: `Signal received for ${segment.name}. It is now queued for moderation in ${city.shortLabel}.`,
    moderationStatus: "under_review",
    reportReference: `nh-${Date.now().toString(36)}`,
  };

  return Response.json(result, { status: 201 });
}
