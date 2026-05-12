import type {
  AppLocale,
  CityData,
  ProductCatalogItem,
  RiskLevel,
  StoreListing,
} from "@/lib/types";

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

export const riskLabelMapEn: Record<RiskLevel, string> = {
  Green: "Low",
  Yellow: "Caution",
  Orange: "Repeated reports",
  Red: "High risk",
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

export const categoryLabelMapEn: Record<string, string> = {
  "Taxi scam": "Taxi scam",
  "Cyclo overcharge": "Cyclo overcharge",
  "Aggressive touting": "Aggressive touting",
  "Forced tip / photo pressure": "Forced tip / photo pressure",
  "Fake goods push": "Fake goods push",
  "Verbal harassment": "Verbal harassment",
  "Sexual harassment": "Sexual harassment",
  Other: "Other",
};

export const timeBucketLabelMap: Record<string, string> = {
  Morning: "오전",
  Afternoon: "오후",
  Evening: "저녁",
  "Late night": "심야",
};

export const timeBucketLabelMapEn: Record<string, string> = {
  Morning: "Morning",
  Afternoon: "Afternoon",
  Evening: "Evening",
  "Late night": "Late night",
};

export const travelerTypeLabelMap: Record<string, string> = {
  "Solo traveler": "혼자 여행",
  Pair: "2인 여행",
  Family: "가족 여행",
  Group: "단체 여행",
  "Digital nomad": "장기 체류",
};

export const travelerTypeLabelMapEn: Record<string, string> = {
  "Solo traveler": "Solo traveler",
  Pair: "Pair",
  Family: "Family",
  Group: "Group",
  "Digital nomad": "Digital nomad",
};

export const shopCorridorPalette = {
  Low: "#4bbd88",
  Medium: "#f1b84b",
  High: "#ea5b3f",
} as const;

export const productCatalog: ProductCatalogItem[] = [
  {
    id: "vietnamese-coffee",
    name: "베트남 커피",
    nameEn: "Vietnamese coffee",
    synonyms: ["커피", "원두", "coffee", "beans", "ca phe", "cafe"],
  },
  {
    id: "ao-dai",
    name: "아오자이",
    nameEn: "Ao dai",
    synonyms: ["아오자이", "ao dai", "dress", "traditional dress"],
  },
  {
    id: "lacquerware",
    name: "라커 공예품",
    nameEn: "Lacquerware",
    synonyms: ["라커", "lacquer", "tray", "bowl", "공예품", "souvenir"],
  },
  {
    id: "silk-scarf",
    name: "실크 스카프",
    nameEn: "Silk scarf",
    synonyms: ["실크", "스카프", "silk", "scarf", "shawl"],
  },
  {
    id: "dried-mango",
    name: "건망고",
    nameEn: "Dried mango",
    synonyms: ["망고", "건망고", "mango", "dried fruit", "snack"],
  },
  {
    id: "pho-spice-kit",
    name: "쌀국수 향신료 세트",
    nameEn: "Pho spice kit",
    synonyms: ["쌀국수", "향신료", "pho", "spice", "soup kit"],
  },
];

export const cities: CityData[] = [
  {
    id: "hcmc-d1",
    shortLabel: "호치민 1군",
    shortLabelEn: "HCMC D1",
    label: "호치민 1군",
    labelEn: "Ho Chi Minh District 1",
    subtitle: "벤탄시장, 부이비엔, 응우옌후에 중심 관광 동선",
    subtitleEn: "Ben Thanh, Bui Vien, and Nguyen Hue tourist corridor",
    mapCenter: { lat: 10.7728, lng: 106.6981 },
    zoom: 15,
    landmarks: [
      {
        label: "벤탄시장",
        labelEn: "Ben Thanh Market",
        position: { lat: 10.77246, lng: 106.69806 },
      },
      {
        label: "응우옌후에",
        labelEn: "Nguyen Hue",
        position: { lat: 10.77384, lng: 106.70412 },
      },
      {
        label: "부이비엔",
        labelEn: "Bui Vien",
        position: { lat: 10.76733, lng: 106.69383 },
      },
    ],
    segments: [
      {
        id: "hcmc-ben-thanh-north",
        name: "벤탄시장 북측 진입로",
        nameEn: "North approach to Ben Thanh Market",
        riskLevel: "Red",
        riskScore: 58,
        summary:
          "시장 진입 직전 택시 권유, 시클로 과다요금, 사진 유도 후 팁 요구가 반복적으로 관측된 구간입니다.",
        summaryEn:
          "This stretch repeatedly shows taxi touting, cyclo overcharging, and photo-tip pressure right before market entry.",
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
        reasonsEn: [
          "Reports repeatedly mention surprise extra charges right after drop-off.",
          "Fake taxi solicitation is still visible in recent review signals.",
          "Approach frequency rises from afternoon into evening.",
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
            placeNameEn: "North drop-off line",
            signalType: "택시 호객 클러스터",
            signalTypeEn: "Taxi tout cluster",
            signalScore: 12,
            evidence:
              "같은 블록 구간에서 택시 권유와 과다요금 전환 사례가 연속적으로 보고되었습니다.",
            evidenceEn:
              "The same block shows repeated reports of taxi approaches turning into overcharge incidents.",
          },
          {
            placeName: "시장 게이트 기념품 라인",
            placeNameEn: "Souvenir gate strip",
            signalType: "사진 유도 후 팁 요구",
            signalTypeEn: "Photo pressure followed by tip demand",
            signalScore: 8,
            evidence:
              "바구니와 소품을 씌운 뒤 비용을 요구한다는 리뷰와 신고가 교차 확인되었습니다.",
            evidenceEn:
              "Reviews and reports both mention props being placed first and payment demanded after.",
          },
        ],
      },
      {
        id: "hcmc-bui-vien-corridor",
        name: "부이비엔 중앙 구간",
        nameEn: "Central Bui Vien corridor",
        riskLevel: "Orange",
        riskScore: 43,
        summary:
          "야간 시간대 바와 거리 상인 유입이 많아 강압적 호객과 사진 유도 신호가 집중되는 구간입니다.",
        summaryEn:
          "At night, dense bar and street-vendor traffic concentrates aggressive touting and photo-pressure signals here.",
        topCategories: ["Aggressive touting", "Forced tip / photo pressure"],
        reasons: [
          "입구 주변에서 반복적인 호객과 진로 방해 신고가 빠르게 쌓여옵니다.",
          "특정 업소 진입 유도와 사진 촬영 압박이 함께 발생하는 패턴이 많습니다.",
          "고위험 구간보다는 낮지만 지속적인 주의가 필요한 축입니다.",
        ],
        reasonsEn: [
          "Frequent reports near the entry mention repeated soliciting and blocked walking paths.",
          "Venue steering and photo pressure often happen together.",
          "Lower than the highest-risk stretch but still requires ongoing caution.",
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
            placeNameEn: "Nightlife entry strip",
            signalType: "야간 호객 밀집",
            signalTypeEn: "Night tout concentration",
            signalScore: 10,
            evidence:
              "짧은 구간 안에서 여러 업소 홍보 인력이 반복적으로 접근한다는 신호가 모였습니다.",
            evidenceEn:
              "Signals cluster around repeated approaches by promo staff in a very short stretch.",
          },
          {
            placeName: "사진 바구니 코너",
            placeNameEn: "Photo basket corner",
            signalType: "소품 착용 후 비용 강요",
            signalTypeEn: "Prop placement followed by payment demand",
            signalScore: 6,
            evidence:
              "소품을 먼저 씌운 뒤 금액을 요구한다는 내용의 보고가 축적되었습니다.",
            evidenceEn:
              "Reports accumulate around props being placed first and charges demanded later.",
          },
        ],
      },
      {
        id: "hcmc-nguyen-hue-axis",
        name: "응우옌후에 보행로 측면",
        nameEn: "Nguyen Hue promenade edge",
        riskLevel: "Yellow",
        riskScore: 24,
        summary:
          "전체적으로는 관리되지만 가로수 아래와 보행로 측면에서 호객과 가짜 상품 권유 신호가 간헐적으로 나타납니다.",
        summaryEn:
          "The boulevard is generally managed, but edge zones and tree-line pockets still show occasional touting and fake-goods pressure.",
        topCategories: ["Aggressive touting", "Fake goods push"],
        reasons: [
          "문제 신호가 전 구간은 아니고 보행로 가장자리 위주로 나타납니다.",
          "주간보다 저녁 시간대에만 일시적으로 빈도가 높아집니다.",
          "즉시 회피가 필요하지는 않지만 경계가 필요한 구간입니다.",
        ],
        reasonsEn: [
          "Signals are localized to the edges rather than the whole boulevard.",
          "Frequency rises mostly during evening hours.",
          "It does not require immediate avoidance, but caution is warranted.",
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
            placeNameEn: "Tree-line edge stalls",
            signalType: "가짜 상품 강매",
            signalTypeEn: "Fake goods pressure",
            signalScore: 5,
            evidence:
              "보행로 주변 소형 판매대에서 모조 액세서리 구매 압박이 있었다는 신호가 확인되었습니다.",
            evidenceEn:
              "Signals mention purchase pressure for imitation accessories from small edge-side stalls.",
          },
        ],
      },
    ],
    shopCorridors: [
      {
        id: "hcmc-ben-thanh-market-grid",
        name: "벤탄시장 북측 상점 골목",
        nameEn: "Ben Thanh north retail alleys",
        level: "High",
        storeCount: 22,
        path: [
          { lat: 10.77302, lng: 106.69712 },
          { lat: 10.77295, lng: 106.69746 },
          { lat: 10.77286, lng: 106.69782 },
          { lat: 10.77277, lng: 106.69819 },
          { lat: 10.77268, lng: 106.69855 },
          { lat: 10.7726, lng: 106.69892 },
        ],
      },
      {
        id: "hcmc-ben-thanh-east-lane",
        name: "시장 동측 기념품 라인",
        nameEn: "East souvenir lane",
        level: "Medium",
        storeCount: 14,
        path: [
          { lat: 10.77289, lng: 106.69878 },
          { lat: 10.77298, lng: 106.69908 },
          { lat: 10.77308, lng: 106.69939 },
          { lat: 10.77318, lng: 106.69969 },
        ],
      },
      {
        id: "hcmc-bui-vien-retail-strip",
        name: "부이비엔 상점 스트립",
        nameEn: "Bui Vien retail strip",
        level: "High",
        storeCount: 18,
        path: [
          { lat: 10.76705, lng: 106.69296 },
          { lat: 10.76718, lng: 106.69336 },
          { lat: 10.76731, lng: 106.69377 },
          { lat: 10.76744, lng: 106.69418 },
          { lat: 10.76757, lng: 106.69458 },
        ],
      },
      {
        id: "hcmc-bui-vien-side-alley",
        name: "부이비엔 측면 골목",
        nameEn: "Bui Vien side alley",
        level: "Low",
        storeCount: 7,
        path: [
          { lat: 10.76722, lng: 106.69351 },
          { lat: 10.76695, lng: 106.69369 },
          { lat: 10.7667, lng: 106.69387 },
        ],
      },
      {
        id: "hcmc-nguyen-hue-retail-edge",
        name: "응우옌후에 리테일 엣지",
        nameEn: "Nguyen Hue retail edge",
        level: "Medium",
        storeCount: 11,
        path: [
          { lat: 10.77401, lng: 106.70352 },
          { lat: 10.77383, lng: 106.70395 },
          { lat: 10.77364, lng: 106.70439 },
          { lat: 10.77347, lng: 106.70482 },
          { lat: 10.77329, lng: 106.70524 },
        ],
      },
    ],
    storeListings: [
      {
        id: "hcmc-coffee-house",
        name: "사이공 커피 랩",
        nameEn: "Saigon Coffee Lab",
        segmentId: "hcmc-ben-thanh-north",
        position: { lat: 10.77281, lng: 106.69902 },
        items: [
          {
            productId: "vietnamese-coffee",
            avgPrice: 165000,
            currency: "VND",
            note: "250g 로부스타 블렌드",
            noteEn: "250g robusta blend",
          },
          {
            productId: "pho-spice-kit",
            avgPrice: 95000,
            currency: "VND",
            note: "간단 조리용 세트",
            noteEn: "Quick-cook kit",
          },
        ],
      },
      {
        id: "hcmc-silk-gallery",
        name: "벤탄 실크 갤러리",
        nameEn: "Ben Thanh Silk Gallery",
        segmentId: "hcmc-ben-thanh-north",
        position: { lat: 10.77255, lng: 106.6986 },
        items: [
          {
            productId: "silk-scarf",
            avgPrice: 280000,
            currency: "VND",
            note: "핸드롤 실크 스카프",
            noteEn: "Hand-rolled silk scarf",
          },
          {
            productId: "ao-dai",
            avgPrice: 890000,
            currency: "VND",
            note: "레디메이드 기본형",
            noteEn: "Ready-made basic cut",
          },
        ],
      },
      {
        id: "hcmc-lacquer-studio",
        name: "응우옌후에 라커 스튜디오",
        nameEn: "Nguyen Hue Lacquer Studio",
        segmentId: "hcmc-nguyen-hue-axis",
        position: { lat: 10.77363, lng: 106.70452 },
        items: [
          {
            productId: "lacquerware",
            avgPrice: 320000,
            currency: "VND",
            note: "중형 트레이 기준",
            noteEn: "Average for medium tray",
          },
          {
            productId: "silk-scarf",
            avgPrice: 260000,
            currency: "VND",
            note: "기념품 등급",
            noteEn: "Souvenir grade",
          },
        ],
      },
      {
        id: "hcmc-snack-stall",
        name: "부이비엔 과일 스낵 하우스",
        nameEn: "Bui Vien Fruit Snack House",
        segmentId: "hcmc-bui-vien-corridor",
        position: { lat: 10.76742, lng: 106.69403 },
        items: [
          {
            productId: "dried-mango",
            avgPrice: 120000,
            currency: "VND",
            note: "200g 소포장",
            noteEn: "200g small pack",
          },
          {
            productId: "vietnamese-coffee",
            avgPrice: 150000,
            currency: "VND",
            note: "관광객 소매 패키지",
            noteEn: "Tourist retail pack",
          },
        ],
      },
    ],
  },
  {
    id: "hanoi-old-quarter",
    shortLabel: "하노이 올드쿼터",
    shortLabelEn: "Hanoi Old Quarter",
    label: "하노이 올드쿼터",
    labelEn: "Hanoi Old Quarter",
    subtitle: "호안끼엠 서측, 야시장 진입로, 따히엔 야간 동선",
    subtitleEn: "Hoan Kiem west side, night market entry, Ta Hien night route",
    mapCenter: { lat: 21.0338, lng: 105.8519 },
    zoom: 15,
    landmarks: [
      {
        label: "호안끼엠",
        labelEn: "Hoan Kiem Lake",
        position: { lat: 21.02883, lng: 105.85239 },
      },
      {
        label: "야시장",
        labelEn: "Night Market",
        position: { lat: 21.03556, lng: 105.8511 },
      },
      {
        label: "따히엔",
        labelEn: "Ta Hien",
        position: { lat: 21.03524, lng: 105.85232 },
      },
    ],
    segments: [
      {
        id: "hanoi-lake-west-approach",
        name: "호안끼엠 서측 접근로",
        nameEn: "West approach to Hoan Kiem",
        riskLevel: "Red",
        riskScore: 54,
        summary:
          "호수 접근 축과 관광 보행로가 겹쳐 시클로 과다요금과 사진 소품 유도 후 팁 강요가 강하게 발생하는 구간입니다.",
        summaryEn:
          "This approach blends lake traffic and tourism footfall, making cyclo overcharge and photo-tip pressure especially strong.",
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
        reasonsEn: [
          "Cyclo reports repeatedly mention charges far above the initial quote.",
          "Traditional photo-prop setups continue to generate payment-demand signals.",
          "The accumulation of duplicate reports supports an avoid recommendation for first-time visitors.",
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
            placeNameEn: "Lake tour corner",
            signalType: "시클로 요금 전환",
            signalTypeEn: "Cyclo price switch",
            signalScore: 11,
            evidence:
              "탑승 전 제시 금액과 도착 후 청구 금액 차이가 크다는 내용의 신호가 반복됩니다.",
            evidenceEn:
              "Signals repeat around major gaps between quoted and final cyclo prices.",
          },
          {
            placeName: "사진 소품 촬영 구간",
            placeNameEn: "Photo-prop strip",
            signalType: "사진 유도 후 팁 강요",
            signalTypeEn: "Photo pressure followed by tip demand",
            signalScore: 9,
            evidence:
              "사진을 찍게 만든 뒤 거절하기 어려운 분위기로 팁을 요구한다는 내용이 누적되었습니다.",
            evidenceEn:
              "Reports describe people being pressured into tipping after being guided into photos.",
          },
        ],
      },
      {
        id: "hanoi-night-market-lane",
        name: "야시장 골목 구간",
        nameEn: "Night market alley section",
        riskLevel: "Orange",
        riskScore: 39,
        summary:
          "야시장 진입 축에서 가짜 상품 권유와 보행 동선을 막는 호객이 자주 발생하는 구간입니다.",
        summaryEn:
          "This night-market approach frequently combines fake-goods pressure with touting that blocks pedestrian flow.",
        topCategories: ["Fake goods push", "Aggressive touting"],
        reasons: [
          "이동 인구가 몰리는 시간대에 판매 압박 강도가 높게 올라옵니다.",
          "금전 피해보다도 진로 방해 체감이 불편하다는 신고가 많습니다.",
          "여러 날짜에 걸쳐 같은 유형이 반복 확인되었습니다.",
        ],
        reasonsEn: [
          "Sales pressure intensifies during crowded hours.",
          "Many reports emphasize blocked movement more than direct monetary loss.",
          "The same pattern appears across multiple dates.",
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
            placeNameEn: "Imitation accessories stall",
            signalType: "가짜 상품 강매",
            signalTypeEn: "Fake goods pressure",
            signalScore: 8,
            evidence:
              "단순 구경 중에도 구매 압박이 이어졌다는 리뷰 신호가 같은 블록에서 반복되었습니다.",
            evidenceEn:
              "The same block repeatedly shows review signals about purchase pressure during casual browsing.",
          },
        ],
      },
      {
        id: "hanoi-ta-hien-entry",
        name: "따히엔 입구 구간",
        nameEn: "Ta Hien entry stretch",
        riskLevel: "Yellow",
        riskScore: 21,
        summary:
          "야간 호객과 언어적 압박이 존재하지만 과다요금보다 불쾌감 중심의 신고가 많은 구간입니다.",
        summaryEn:
          "Nighttime touting and verbal pressure are present here, though reports are more about discomfort than overcharging.",
        topCategories: ["Aggressive touting", "Verbal harassment"],
        reasons: [
          "거절 의사 이후에도 계속 불러 세운다는 신고가 반복됩니다.",
          "심야 시간대에 집중되지만 규모는 고위험 구간보다 낮습니다.",
          "경계는 필요하지만 즉시 회피가 필요한 수준은 아닙니다.",
        ],
        reasonsEn: [
          "Reports repeat around continued solicitation after clear refusal.",
          "It clusters late at night but on a smaller scale than red-risk stretches.",
          "Caution is useful, but immediate avoidance is not usually required.",
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
            placeNameEn: "Night entry tout line",
            signalType: "언어적 압박",
            signalTypeEn: "Verbal pressure",
            signalScore: 4,
            evidence:
              "거절 의사 이후에도 따라붙었다는 신고가 입구 짧은 구간에 집중됩니다.",
            evidenceEn:
              "Short entry stretches concentrate reports of people being followed after refusing.",
          },
        ],
      },
    ],
    shopCorridors: [
      {
        id: "hanoi-lake-market-lane",
        name: "호안끼엠 서측 상점 골목",
        nameEn: "West Hoan Kiem retail lane",
        level: "High",
        storeCount: 20,
        path: [
          { lat: 21.02986, lng: 105.85079 },
          { lat: 21.02961, lng: 105.85118 },
          { lat: 21.02935, lng: 105.85157 },
          { lat: 21.02909, lng: 105.85197 },
          { lat: 21.02884, lng: 105.85235 },
        ],
      },
      {
        id: "hanoi-night-market-main",
        name: "야시장 메인 골목",
        nameEn: "Night market main alley",
        level: "High",
        storeCount: 24,
        path: [
          { lat: 21.03595, lng: 105.84966 },
          { lat: 21.03586, lng: 105.85012 },
          { lat: 21.03577, lng: 105.85058 },
          { lat: 21.03568, lng: 105.85104 },
          { lat: 21.03558, lng: 105.8515 },
          { lat: 21.03549, lng: 105.85196 },
        ],
      },
      {
        id: "hanoi-night-market-cross",
        name: "야시장 교차 골목",
        nameEn: "Night market cross lane",
        level: "Medium",
        storeCount: 12,
        path: [
          { lat: 21.03571, lng: 105.85059 },
          { lat: 21.03541, lng: 105.85078 },
          { lat: 21.03511, lng: 105.85098 },
        ],
      },
      {
        id: "hanoi-ta-hien-retail",
        name: "따히엔 상점 구간",
        nameEn: "Ta Hien retail strip",
        level: "Medium",
        storeCount: 10,
        path: [
          { lat: 21.03587, lng: 105.85177 },
          { lat: 21.03567, lng: 105.85205 },
          { lat: 21.03547, lng: 105.85233 },
          { lat: 21.03528, lng: 105.85262 },
          { lat: 21.03509, lng: 105.8529 },
        ],
      },
      {
        id: "hanoi-ta-hien-side-lane",
        name: "따히엔 측면 골목",
        nameEn: "Ta Hien side lane",
        level: "Low",
        storeCount: 6,
        path: [
          { lat: 21.03542, lng: 105.85236 },
          { lat: 21.03523, lng: 105.85214 },
          { lat: 21.03504, lng: 105.85192 },
        ],
      },
    ],
    storeListings: [
      {
        id: "hanoi-coffee-roasters",
        name: "호안끼엠 커피 로스터스",
        nameEn: "Hoan Kiem Coffee Roasters",
        segmentId: "hanoi-lake-west-approach",
        position: { lat: 21.02924, lng: 105.85166 },
        items: [
          {
            productId: "vietnamese-coffee",
            avgPrice: 175000,
            currency: "VND",
            note: "250g 아라비카 블렌드",
            noteEn: "250g arabica blend",
          },
          {
            productId: "pho-spice-kit",
            avgPrice: 110000,
            currency: "VND",
            note: "육수 향신료 팩",
            noteEn: "Broth spice pack",
          },
        ],
      },
      {
        id: "hanoi-textile-house",
        name: "올드쿼터 텍스타일 하우스",
        nameEn: "Old Quarter Textile House",
        segmentId: "hanoi-ta-hien-entry",
        position: { lat: 21.0353, lng: 105.85258 },
        items: [
          {
            productId: "ao-dai",
            avgPrice: 920000,
            currency: "VND",
            note: "여행객용 레디메이드",
            noteEn: "Traveller-ready standard cut",
          },
          {
            productId: "silk-scarf",
            avgPrice: 240000,
            currency: "VND",
            note: "실크 혼방",
            noteEn: "Silk blend",
          },
        ],
      },
      {
        id: "hanoi-lacquer-corner",
        name: "야시장 라커 코너",
        nameEn: "Night Market Lacquer Corner",
        segmentId: "hanoi-night-market-lane",
        position: { lat: 21.0357, lng: 105.85072 },
        items: [
          {
            productId: "lacquerware",
            avgPrice: 350000,
            currency: "VND",
            note: "중형 보울 기준",
            noteEn: "Average for medium bowl",
          },
          {
            productId: "dried-mango",
            avgPrice: 115000,
            currency: "VND",
            note: "150g 기프트팩",
            noteEn: "150g gift pack",
          },
        ],
      },
      {
        id: "hanoi-fruit-grocer",
        name: "호안끼엠 과일 셀렉트",
        nameEn: "Hoan Kiem Fruit Select",
        segmentId: "hanoi-lake-west-approach",
        position: { lat: 21.02896, lng: 105.85244 },
        items: [
          {
            productId: "dried-mango",
            avgPrice: 98000,
            currency: "VND",
            note: "로컬 마켓 패키지",
            noteEn: "Local market pack",
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

export function formatPrice(currency: string, amount: number, locale: AppLocale) {
  if (currency === "VND") {
    return `${new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US").format(
      amount,
    )} VND`;
  }

  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function resolveProductQuery(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const scored = productCatalog
    .map((item) => {
      const haystack = [item.name, item.nameEn, ...item.synonyms].map((value) =>
        value.toLowerCase(),
      );
      const score = haystack.reduce((acc, keyword) => {
        if (normalized === keyword) {
          return acc + 10;
        }
        if (keyword.includes(normalized) || normalized.includes(keyword)) {
          return acc + 4;
        }
        return acc;
      }, 0);

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.item ?? null;
}

export function getStoresForProduct(city: CityData, productId: string) {
  return city.storeListings.filter((store) =>
    store.items.some((item) => item.productId === productId),
  );
}

export function getStoreProductPrice(store: StoreListing, productId: string) {
  return store.items.find((item) => item.productId === productId);
}
