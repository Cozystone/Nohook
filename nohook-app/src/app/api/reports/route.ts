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
      { ok: false, message: "필수 신고 항목이 누락되었습니다." },
      { status: 400 },
    );
  }

  const city = findCity(payload.cityId!);
  const segment = findSegment(payload.segmentId!);

  if (!city || !segment) {
    return Response.json(
      { ok: false, message: "도시 또는 도로 구간 정보가 올바르지 않습니다." },
      { status: 404 },
    );
  }

  const result: ReportSubmissionResult = {
    ok: true,
    message: `${segment.name} 구간 신고가 접수되었습니다. 현재 ${city.shortLabel} 운영 검수 대기열에 등록되었습니다.`,
    moderationStatus: "under_review",
    reportReference: `nh-${Date.now().toString(36)}`,
  };

  return Response.json(result, { status: 201 });
}
