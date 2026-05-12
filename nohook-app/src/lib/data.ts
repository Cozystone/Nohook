import type { CityData, RiskLevel } from "@/lib/types";

export const riskPalette: Record<RiskLevel, string> = {
  Green: "#2ea67b",
  Yellow: "#f1b84b",
  Orange: "#f36d3f",
  Red: "#d6453a",
};

export const riskLabelMap: Record<RiskLevel, string> = {
  Green: "낮음",
  Yellow: "주의",
  Orange: "반복 신고",
  Red: "고위험",
};

export const categoryLabelMap: Record<string, string> = {
  "Taxi scam": "택시 바가지",
  "Cyclo overcharge": "시클로 과다요금",
  "Aggressive touting": "강압적 호객",
  "Forced tip / photo pressure": "사진 유도 후 팁 강요",
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
  "Digital nomad": "장기 체류",
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
      { label: "벤탄시장", position: { lat: 10.77246, lng: 106.69806 } },
      { label: "응우옌후에", position: { lat: 10.77384, lng: 106.70412 } },
      { label: "부이비엔", position: { lat: 10.76733, lng: 106.69383 } },
    ],
    segments: [
      {
        id: "hcmc-ben-thanh-north",
        name: "벤탄시장 북측 진입로",
        riskLevel: "Red",
        riskScore: 58,
        summary:
          "시장 진입 직전 택시 권유, 시클로 과다요금, 사진 유도 후 팁 요구가 반복적으로 관측된 구간입니다.",
        topCategories: [
          "Taxi scam",
          "Cyclo overcharge",
          "Aggressive touting",
        ],
        reasons: [
          "하차 직후 추가 금액을 요구받았다는 신고가 반복적으로 올라옵니다.",
          "가짜 택시와 불법 영업 유도가 최근 리뷰 신호에도 다시 나타났습니다.",
          "오후부터 저녁 사이 관광객 밀집도가 높아 접근 빈도가 커집니다.",
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
            placeName: "벤탄시장 북측 하차 라인",
            signalType: "택시 호객 클러스터",
            signalScore: 12,
            evidence:
              "같은 블록 구간에서 택시 권유와 과다요금 전환 사례가 연속적으로 보고되었습니다.",
          },
          {
            placeName: "시장 게이트 기념품 라인",
            signalType: "사진 유도 후 팁 요구",
            signalScore: 8,
            evidence:
              "바구니와 소품을 씌운 뒤 비용을 요구한다는 리뷰와 신고가 교차 확인되었습니다.",
          },
        ],
      },
      {
        id: "hcmc-bui-vien-corridor",
        name: "부이비엔 중앙 구간",
        riskLevel: "Orange",
        riskScore: 43,
        summary:
          "야간 시간대 바와 거리 상인 유입이 많아 강압적 호객과 사진 유도 신호가 집중되는 구간입니다.",
        topCategories: ["Aggressive touting", "Forced tip / photo pressure"],
        reasons: [
          "입구 주변에서 반복적인 호객과 진로 방해 신고가 빠르게 쌓여옵니다.",
          "특정 업소 진입 유도와 사진 촬영 압박이 함께 발생하는 패턴이 많습니다.",
          "고위험 구간보다는 낮지만 지속적인 주의가 필요한 축입니다.",
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
            placeName: "나이트라이프 입구 스트립",
            signalType: "야간 호객 밀집",
            signalScore: 10,
            evidence:
              "짧은 구간 안에서 여러 업소 홍보 인력이 반복적으로 접근한다는 신호가 모였습니다.",
          },
          {
            placeName: "사진 바구니 코너",
            signalType: "소품 착용 후 비용 강요",
            signalScore: 6,
            evidence:
              "소품을 먼저 씌운 뒤 금액을 요구한다는 내용의 보고가 축적되었습니다.",
          },
        ],
      },
      {
        id: "hcmc-nguyen-hue-axis",
        name: "응우옌후에 보행로 측면",
        riskLevel: "Yellow",
        riskScore: 24,
        summary:
          "전체적으로는 관리되지만 가로수 아래와 보행로 측면에서 호객과 가짜 상품 권유 신호가 간헐적으로 나타납니다.",
        topCategories: ["Aggressive touting", "Fake goods push"],
        reasons: [
          "문제 신호가 전 구간은 아니고 보행로 가장자리 위주로 나타납니다.",
          "주간보다 저녁 시간대에만 일시적으로 빈도가 높아집니다.",
          "즉시 회피가 필요하지는 않지만 경계가 필요한 구간입니다.",
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
            placeName: "보행로 가로수 아래",
            signalType: "가짜 상품 강매",
            signalScore: 5,
            evidence:
              "보행로 주변 소형 판매대에서 모조 액세서리 구매 압박이 있었다는 신호가 확인되었습니다.",
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
      { label: "호안끼엠", position: { lat: 21.02883, lng: 105.85239 } },
      { label: "야시장", position: { lat: 21.03556, lng: 105.8511 } },
      { label: "따히엔", position: { lat: 21.03524, lng: 105.85232 } },
    ],
    segments: [
      {
        id: "hanoi-lake-west-approach",
        name: "호안끼엠 서측 접근로",
        riskLevel: "Red",
        riskScore: 54,
        summary:
          "호수 접근 축과 관광 보행로가 겹쳐 시클로 과다요금과 사진 소품 유도 후 팁 강요가 강하게 발생하는 구간입니다.",
        topCategories: [
          "Cyclo overcharge",
          "Forced tip / photo pressure",
          "Aggressive touting",
        ],
        reasons: [
          "처음 제시한 금액보다 크게 추가 청구한다는 시클로 신고 패턴이 반복됩니다.",
          "전통 소품과 바구니를 이용한 사진 유도 후 금액 요구 신호가 계속 쌓입니다.",
          "중복 신고가 누적되고 있어 첫 방문자 기준 회피 권고 구간입니다.",
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
            placeName: "호수 투어 코너",
            signalType: "시클로 요금 전환",
            signalScore: 11,
            evidence:
              "탑승 전 제시 금액과 도착 후 청구 금액 차이가 크다는 내용의 신호가 반복됩니다.",
          },
          {
            placeName: "사진 소품 촬영 구간",
            signalType: "사진 유도 후 팁 강요",
            signalScore: 9,
            evidence:
              "사진을 찍게 만든 뒤 거절하기 어려운 분위기로 팁을 요구한다는 내용이 누적되었습니다.",
          },
        ],
      },
      {
        id: "hanoi-night-market-lane",
        name: "야시장 골목 구간",
        riskLevel: "Orange",
        riskScore: 39,
        summary:
          "야시장 진입 축에서 가짜 상품 권유와 보행 동선을 막는 호객이 자주 발생하는 구간입니다.",
        topCategories: ["Fake goods push", "Aggressive touting"],
        reasons: [
          "이동 인구가 몰리는 시간대에 판매 압박 강도가 높게 올라옵니다.",
          "금전 피해보다도 진로 방해 체감이 불편하다는 신고가 많습니다.",
          "여러 날짜에 걸쳐 같은 유형이 반복 확인되었습니다.",
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
            placeName: "모조 액세서리 판매대",
            signalType: "가짜 상품 강매",
            signalScore: 8,
            evidence:
              "단순 구경 중에도 구매 압박이 이어졌다는 리뷰 신호가 같은 블록에서 반복되었습니다.",
          },
        ],
      },
      {
        id: "hanoi-ta-hien-entry",
        name: "따히엔 입구 구간",
        riskLevel: "Yellow",
        riskScore: 21,
        summary:
          "야간 호객과 언어적 압박이 존재하지만 과다요금보다 불쾌감 중심의 신고가 많은 구간입니다.",
        topCategories: ["Aggressive touting", "Verbal harassment"],
        reasons: [
          "사진 설명 중에도 계속 불러 세운다는 신고가 반복됩니다.",
          "심야 시간대에 집중되지만 규모는 고위험 구간보다 낮습니다.",
          "경계는 필요하지만 즉시 회피가 필요한 수준은 아닙니다.",
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
            placeName: "야간 입구 호객 라인",
            signalType: "언어적 압박",
            signalScore: 4,
            evidence:
              "거절 의사 이후에도 따라붙었다는 신고가 입구 짧은 구간에 집중됩니다.",
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
