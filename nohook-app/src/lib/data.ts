import type { CityData, RiskLevel } from "@/lib/types";

export const riskPalette: Record<RiskLevel, string> = {
  Green: "#1f9d77",
  Yellow: "#f0b23c",
  Orange: "#f06a3a",
  Red: "#cf3f2f",
};

export const riskLabelMap: Record<RiskLevel, string> = {
  Green: "낮음",
  Yellow: "주의",
  Orange: "반복 신고",
  Red: "위험",
};

export const categoryLabelMap: Record<string, string> = {
  "Taxi scam": "택시 바가지/사기",
  "Cyclo overcharge": "시클로 과다요금",
  "Aggressive touting": "강압적 호객",
  "Forced tip / photo pressure": "사진 유도·팁 강요",
  "Fake goods push": "가짜 상품 강매",
  "Verbal harassment": "언어적 괴롭힘",
  "Sexual harassment": "성적 괴롭힘",
  Other: "기타",
};

export const timeBucketLabelMap: Record<string, string> = {
  Morning: "오전",
  Afternoon: "오후",
  Evening: "저녁",
  "Late night": "심야",
};

export const travelerTypeLabelMap: Record<string, string> = {
  "Solo traveler": "혼자 여행",
  Pair: "2인 여행",
  Family: "가족 여행",
  Group: "단체 여행",
  "Digital nomad": "디지털 노마드",
};

export const cities: CityData[] = [
  {
    id: "hcmc-d1",
    shortLabel: "호치민 1군",
    label: "호치민 1군",
    subtitle: "벤탄시장, 부이비엔, 응우옌후에 중심 관광 동선",
    mapCenter: { lat: 10.7728, lng: 106.6981 },
    zoom: 15,
    landmarks: [
      { label: "Ben Thanh", position: { lat: 10.77246, lng: 106.69806 } },
      { label: "Nguyen Hue", position: { lat: 10.77384, lng: 106.70412 } },
      { label: "Bui Vien", position: { lat: 10.76733, lng: 106.69383 } },
    ],
    segments: [
      {
        id: "hcmc-ben-thanh-north",
        name: "벤탄시장 북측 진입로",
        riskLevel: "Red",
        riskScore: 58,
        summary:
          "시장 출입구와 택시 승하차 지점이 겹쳐 과다요금 요구와 강한 호객 신호가 반복됩니다.",
        topCategories: [
          "Taxi scam",
          "Cyclo overcharge",
          "Aggressive touting",
        ],
        reasons: [
          "하차 후 추가 금액을 요구했다는 승인 신고가 반복적으로 누적됨.",
          "가짜 택시, 과도한 탑승 권유 관련 리뷰 신호가 최근에도 이어짐.",
          "오후부터 저녁 사이 관광객 밀집 시간대에 신호가 가장 강함.",
        ],
        recentReportCount: 9,
        path: [
          { lat: 10.77272, lng: 106.69732 },
          { lat: 10.77276, lng: 106.6978 },
          { lat: 10.7727, lng: 106.69831 },
          { lat: 10.77262, lng: 106.69884 },
          { lat: 10.77256, lng: 106.69936 },
        ],
        placeSignals: [
          {
            placeName: "Ben Thanh curb pickup lane",
            signalType: "승차 호객 클러스터",
            signalScore: 12,
            evidence:
              "같은 노변 구간에서 택시 권유와 요금 전환을 겪었다는 여행자 신고가 연속으로 발생했습니다.",
          },
          {
            placeName: "Market gate souvenir strip",
            signalType: "사진 유도 후 팁 요구",
            signalScore: 8,
            evidence:
              "사진 소품을 먼저 씌운 뒤 팁을 요구했다는 신호가 시장 게이트 주변에서 반복됩니다.",
          },
        ],
      },
      {
        id: "hcmc-bui-vien-corridor",
        name: "부이비엔 중앙 구간",
        riskLevel: "Orange",
        riskScore: 43,
        summary:
          "야간 시간대 바·거리 상인 유입이 많아 호객, 경로 유도, 사진 강요 신호가 집중됩니다.",
        topCategories: ["Aggressive touting", "Forced tip / photo pressure"],
        reasons: [
          "해가 진 뒤부터 반복 호객과 바 유도 신고가 급증함.",
          "여행자를 특정 업소로 끌어들이려는 시도와 사진 유도 패턴이 함께 포착됨.",
          "강한 주의가 필요하지만 시장 북측 구간보다는 금전 피해 강도가 낮음.",
        ],
        recentReportCount: 6,
        path: [
          { lat: 10.76711, lng: 106.69309 },
          { lat: 10.76723, lng: 106.69348 },
          { lat: 10.76735, lng: 106.69388 },
          { lat: 10.76747, lng: 106.69427 },
          { lat: 10.7676, lng: 106.69467 },
        ],
        placeSignals: [
          {
            placeName: "Nightlife entry strip",
            signalType: "야간 호객 압박",
            signalScore: 10,
            evidence:
              "짧은 블록 안에서 여러 업소 홍보 인력이 반복적으로 접근했다는 신호가 묶여 있습니다.",
          },
          {
            placeName: "Photo basket corner",
            signalType: "소품 착용 후 팁 강요",
            signalScore: 6,
            evidence:
              "바구니 소품을 씌운 뒤 비용을 요구했다는 리뷰와 신고가 교차 확인됐습니다.",
          },
        ],
      },
      {
        id: "hcmc-nguyen-hue-axis",
        name: "응우옌후에 산책로 외곽",
        riskLevel: "Yellow",
        riskScore: 24,
        summary:
          "전체적으로는 관리되는 편이지만 산책로 가장자리에서 비공식 탑승 권유와 소규모 강매 신호가 간헐적으로 나타납니다.",
        topCategories: ["Aggressive touting", "Fake goods push"],
        reasons: [
          "문제 신호가 전체 축이 아니라 일부 가장자리 포인트에 집중됨.",
          "주간에는 상대적으로 약하고 저녁 시간대에만 산발적으로 증가함.",
          "주의 구간이지만 즉시 회피 수준까지는 아님.",
        ],
        recentReportCount: 3,
        path: [
          { lat: 10.77398, lng: 106.70358 },
          { lat: 10.77383, lng: 106.70396 },
          { lat: 10.77369, lng: 106.70433 },
          { lat: 10.77354, lng: 106.70471 },
          { lat: 10.77339, lng: 106.70508 },
        ],
        placeSignals: [
          {
            placeName: "Promenade edge kiosks",
            signalType: "가짜 상품 강매",
            signalScore: 5,
            evidence:
              "산책로 외곽 키오스크에서 모조 액세서리를 강하게 권했다는 신호가 누적됐습니다.",
          },
        ],
      },
    ],
  },
  {
    id: "hanoi-old-quarter",
    shortLabel: "하노이 올드쿼터",
    label: "하노이 올드쿼터",
    subtitle: "호안끼엠 서측, 야시장 진입로, 따히엔 야간 동선",
    mapCenter: { lat: 21.0338, lng: 105.8519 },
    zoom: 15,
    landmarks: [
      { label: "Hoan Kiem", position: { lat: 21.02883, lng: 105.85239 } },
      { label: "Night Market", position: { lat: 21.03556, lng: 105.8511 } },
      { label: "Ta Hien", position: { lat: 21.03524, lng: 105.85232 } },
    ],
    segments: [
      {
        id: "hanoi-lake-west-approach",
        name: "호안끼엠 서측 접근로",
        riskLevel: "Red",
        riskScore: 54,
        summary:
          "호수 접근 지점과 관광 병목 구간이 겹쳐 시클로 과다요금과 사진 유도 후 팁 요구가 강하게 포착됩니다.",
        topCategories: [
          "Cyclo overcharge",
          "Forced tip / photo pressure",
          "Aggressive touting",
        ],
        reasons: [
          "처음 제시한 금액보다 크게 더 요구했다는 시클로 신고 패턴이 반복됨.",
          "전통 소품 착용 사진 후 팁을 강요했다는 신호가 동일 축에서 계속 관찰됨.",
          "중복 신고를 제한해도 스코어가 높게 유지될 정도로 밀도가 높음.",
        ],
        recentReportCount: 8,
        path: [
          { lat: 21.02972, lng: 105.85095 },
          { lat: 21.02945, lng: 105.85139 },
          { lat: 21.02919, lng: 105.85182 },
          { lat: 21.02893, lng: 105.85223 },
          { lat: 21.02868, lng: 105.85263 },
        ],
        placeSignals: [
          {
            placeName: "Lake tour corner",
            signalType: "시클로 과금 전환",
            signalScore: 11,
            evidence:
              "탑승 전 제시 금액과 도착 후 청구 금액이 크게 달랐다는 여행자 신호가 반복됩니다.",
          },
          {
            placeName: "Photo prop pocket",
            signalType: "사진 후 팁 강요",
            signalScore: 9,
            evidence:
              "사진을 찍고 나서 거절하기 어려운 분위기로 팁을 요구했다는 신호가 누적됩니다.",
          },
        ],
      },
      {
        id: "hanoi-night-market-lane",
        name: "야시장 병목 구간",
        riskLevel: "Orange",
        riskScore: 39,
        summary:
          "야시장 인파로 인해 가짜 상품 권유와 보행 동선을 막는 호객이 자주 발생합니다.",
        topCategories: ["Fake goods push", "Aggressive touting"],
        reasons: [
          "유동 인구가 몰리는 시간대에 판매 압박이 강해짐.",
          "금전 피해보다 강매와 진로 방해 성격의 신고가 더 많음.",
          "여러 날짜에 걸쳐 비슷한 유형의 신호가 반복 승인됨.",
        ],
        recentReportCount: 5,
        path: [
          { lat: 21.03589, lng: 105.84977 },
          { lat: 21.03581, lng: 105.85028 },
          { lat: 21.03572, lng: 105.85079 },
          { lat: 21.03562, lng: 105.8513 },
          { lat: 21.03553, lng: 105.8518 },
        ],
        placeSignals: [
          {
            placeName: "Counterfeit accessory stalls",
            signalType: "가짜 상품 강매",
            signalScore: 8,
            evidence:
              "단순 구경 뒤에도 구매 압박이 이어졌다는 리뷰 신호가 같은 블록에서 반복됩니다.",
          },
        ],
      },
      {
        id: "hanoi-ta-hien-entry",
        name: "따히엔 입구 구간",
        riskLevel: "Yellow",
        riskScore: 21,
        summary:
          "야간 호객과 언어적 압박이 존재하지만, 과다요금형 피해보다는 불쾌감 중심 신호가 더 많습니다.",
        topCategories: ["Aggressive touting", "Verbal harassment"],
        reasons: [
          "재정 피해보다 반복 권유와 언어적 압박 신고가 중심임.",
          "심야 시간대에 집중되지만 규모는 오렌지 구간보다 낮음.",
          "경계는 필요하나 즉시 회피 수준은 아님.",
        ],
        recentReportCount: 2,
        path: [
          { lat: 21.03582, lng: 105.85186 },
          { lat: 21.03562, lng: 105.85215 },
          { lat: 21.03541, lng: 105.85244 },
          { lat: 21.03522, lng: 105.85272 },
          { lat: 21.03503, lng: 105.85301 },
        ],
        placeSignals: [
          {
            placeName: "Night entry promoters",
            signalType: "언어적 압박",
            signalScore: 4,
            evidence:
              "거절 후에도 계속 부르거나 따라붙었다는 신고가 이 입구 구간에 집중됩니다.",
          },
        ],
      },
    ],
  },
];

export function findCity(cityId: string) {
  return cities.find((city) => city.id === cityId);
}

export function findSegment(segmentId: string) {
  return cities
    .flatMap((city) => city.segments)
    .find((segment) => segment.id === segmentId);
}
