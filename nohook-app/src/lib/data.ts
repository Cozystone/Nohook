import type { CityData } from "@/lib/types";

export const cities: CityData[] = [
  {
    id: "hcmc-d1",
    shortLabel: "HCMC D1",
    label: "Ho Chi Minh City District 1",
    subtitle: "Ben Thanh, Bui Vien, and Nguyen Hue walking corridors",
    landmarks: [
      { label: "Ben Thanh", x: 132, y: 112 },
      { label: "Nguyen Hue", x: 366, y: 88 },
      { label: "Bui Vien", x: 250, y: 266 },
    ],
    segments: [
      {
        id: "hcmc-ben-thanh-north",
        name: "Ben Thanh North Edge",
        riskLevel: "Red",
        riskScore: 58,
        summary:
          "Frequent overcharge and aggressive transport solicitation signals cluster around market exits and curbside pickup points.",
        topCategories: [
          "Taxi scam",
          "Cyclo overcharge",
          "Aggressive touting",
        ],
        reasons: [
          "Approved reports mention drivers quoting one price and demanding more after drop-off.",
          "Recent review evidence repeats 'fake taxi' and 'pushy ride offers' language.",
          "Signals intensify in late afternoon through evening when tourist footfall spikes.",
        ],
        recentReportCount: 9,
        mapPath: "M86 120 C122 116, 162 108, 214 102",
        placeSignals: [
          {
            placeName: "Ben Thanh curb pickup lane",
            signalType: "Ride solicitation cluster",
            signalScore: 12,
            evidence:
              "Three recent traveler reports describe persistent taxi offers and rate switching near the same curb.",
          },
          {
            placeName: "Market gate souvenir strip",
            signalType: "Forced tip pressure",
            signalScore: 8,
            evidence:
              "Review snippets repeatedly mention photo props being placed on tourists before demanding a tip.",
          },
        ],
      },
      {
        id: "hcmc-bui-vien-corridor",
        name: "Bui Vien Central Corridor",
        riskLevel: "Orange",
        riskScore: 43,
        summary:
          "High evening friction from repeated touting, drink upsell pressure, and route redirection by street vendors.",
        topCategories: ["Aggressive touting", "Forced tip / photo pressure"],
        reasons: [
          "Signals spike after sunset and correlate with dense nightlife foot traffic.",
          "Traveler reports describe repeated attempts to steer visitors into bars or paid photo setups.",
          "Nearby venue review signals are diverse, so the road remains cautionary rather than fully avoid.",
        ],
        recentReportCount: 6,
        mapPath: "M202 284 C246 270, 286 258, 338 246",
        placeSignals: [
          {
            placeName: "Nightlife entry strip",
            signalType: "Touting pressure",
            signalScore: 10,
            evidence:
              "Clustered reports cite repeated verbal pressure from multiple promoters across a short block.",
          },
          {
            placeName: "Photo basket corner",
            signalType: "Forced tip pattern",
            signalScore: 6,
            evidence:
              "Two review signals and one report mention baskets or props being placed on tourists first, payment demanded after.",
          },
        ],
      },
      {
        id: "hcmc-nguyen-hue-axis",
        name: "Nguyen Hue Riverside Axis",
        riskLevel: "Yellow",
        riskScore: 24,
        summary:
          "Mostly manageable, but periodic unofficial ride offers and small-item pressure appear near promenade edges.",
        topCategories: ["Aggressive touting", "Fake goods push"],
        reasons: [
          "Signals are intermittent rather than sustained.",
          "Most evidence comes from edge areas rather than the full promenade spine.",
          "Approved reports are lower volume and often daytime only.",
        ],
        recentReportCount: 3,
        mapPath: "M346 86 C370 124, 398 170, 426 224",
        placeSignals: [
          {
            placeName: "Promenade edge kiosks",
            signalType: "Fake goods push",
            signalScore: 5,
            evidence:
              "Review language references counterfeit accessories and aggressive follow-up after browsing.",
          },
        ],
      },
    ],
  },
  {
    id: "hanoi-old-quarter",
    shortLabel: "Hanoi OQ",
    label: "Hanoi Old Quarter",
    subtitle: "Hoan Kiem, market lanes, and cyclo-heavy intersections",
    landmarks: [
      { label: "Hoan Kiem", x: 380, y: 120 },
      { label: "Night Market", x: 226, y: 178 },
      { label: "Ta Hien", x: 248, y: 262 },
    ],
    segments: [
      {
        id: "hanoi-lake-west-approach",
        name: "Hoan Kiem West Approach",
        riskLevel: "Red",
        riskScore: 54,
        summary:
          "Strong cyclo overcharge and unsolicited photo-op pressure near lake access points and tour choke points.",
        topCategories: [
          "Cyclo overcharge",
          "Forced tip / photo pressure",
          "Aggressive touting",
        ],
        reasons: [
          "Cyclo negotiation complaints repeat with a consistent bait-price then surcharge pattern.",
          "Tourist photo props and shoulder-basket interactions are repeatedly described in the same corridor.",
          "Signal density is high despite moderation caps on duplicated reports.",
        ],
        recentReportCount: 8,
        mapPath: "M286 142 C330 136, 374 126, 430 118",
        placeSignals: [
          {
            placeName: "Lake tour corner",
            signalType: "Cyclo surcharge pattern",
            signalScore: 11,
            evidence:
              "Multiple travelers report one quoted amount before departure and a much larger demand on arrival.",
          },
          {
            placeName: "Photo prop pocket",
            signalType: "Forced tip pressure",
            signalScore: 9,
            evidence:
              "Review evidence includes tourists feeling cornered into tipping after posed photos.",
          },
        ],
      },
      {
        id: "hanoi-night-market-lane",
        name: "Night Market Funnel",
        riskLevel: "Orange",
        riskScore: 39,
        summary:
          "Dense vendor pressure with counterfeit goods upsell and persistent line-of-walk interruption during peak evening hours.",
        topCategories: ["Fake goods push", "Aggressive touting"],
        reasons: [
          "Crowd density creates frequent stop-and-sell interactions.",
          "Signals are high but skew toward pressure rather than larger fare scams.",
          "Moderators continue to approve repeat complaints from multiple nights.",
        ],
        recentReportCount: 5,
        mapPath: "M166 194 C214 188, 258 180, 308 174",
        placeSignals: [
          {
            placeName: "Counterfeit accessory stalls",
            signalType: "Fake goods push",
            signalScore: 8,
            evidence:
              "Review snippets describe sellers escalating from browsing invitations to repeated purchase pressure.",
          },
        ],
      },
      {
        id: "hanoi-ta-hien-entry",
        name: "Ta Hien Entry Street",
        riskLevel: "Yellow",
        riskScore: 21,
        summary:
          "A watchful route with moderate verbal touting and nightlife redirection, but fewer severe pricing disputes.",
        topCategories: ["Aggressive touting", "Verbal harassment"],
        reasons: [
          "Most signals are nuisance-level rather than strong financial harm patterns.",
          "Reports cluster on late-night verbal pressure and repeated invitations.",
          "Current volume remains below the orange threshold.",
        ],
        recentReportCount: 2,
        mapPath: "M214 280 C242 266, 272 250, 308 230",
        placeSignals: [
          {
            placeName: "Night entry promoters",
            signalType: "Verbal pressure",
            signalScore: 4,
            evidence:
              "Traveler reports mention repeated invitations and refusal not being respected quickly.",
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
