import type { GeoDbCitySuggestion } from "@/lib/types";

function toFallbackSuggestions(query: string) {
  const normalized = query.trim().toLowerCase();

  const base: GeoDbCitySuggestion[] = [
    {
      id: "hcmc-d1",
      name: "Ho Chi Minh City",
      region: "Ho Chi Minh",
      country: "Vietnam",
      latitude: 10.7728,
      longitude: 106.6981,
      supportedCityId: "hcmc-d1",
    },
    {
      id: "hanoi-old-quarter",
      name: "Hanoi",
      region: "Ha Noi",
      country: "Vietnam",
      latitude: 21.0338,
      longitude: 105.8519,
      supportedCityId: "hanoi-old-quarter",
    },
  ];

  if (!normalized) {
    return base;
  }

  return base.filter((item) =>
    [item.name, item.region, item.country, item.supportedCityId]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalized)),
  );
}

function mapSupportedCityId(name: string, region: string) {
  const value = `${name} ${region}`.toLowerCase();

  if (
    value.includes("ho chi minh") ||
    value.includes("saigon") ||
    value.includes("hồ chí minh")
  ) {
    return "hcmc-d1";
  }

  if (value.includes("hanoi") || value.includes("ha noi")) {
    return "hanoi-old-quarter";
  }

  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  const apiKey = process.env.GEODB_API_KEY;
  const apiHost =
    process.env.GEODB_API_HOST ?? "wft-geo-db.p.rapidapi.com";

  if (!apiKey) {
    return Response.json({
      ok: true,
      source: "fallback",
      data: toFallbackSuggestions(query),
    });
  }

  const endpoint = new URL(`https://${apiHost}/v1/geo/cities`);
  endpoint.searchParams.set("countryIds", "VN");
  endpoint.searchParams.set("limit", "8");
  endpoint.searchParams.set("languageCode", "en");
  endpoint.searchParams.set("sort", "-population");
  if (query) {
    endpoint.searchParams.set("namePrefix", query);
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GeoDB request failed: ${response.status}`);
    }

    const json = (await response.json()) as {
      data?: Array<{
        id: number | string;
        city: string;
        region: string;
        country: string;
        latitude: number;
        longitude: number;
      }>;
    };

    const data: GeoDbCitySuggestion[] =
      json.data?.map((item) => ({
        id: String(item.id),
        name: item.city,
        region: item.region,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude,
        supportedCityId: mapSupportedCityId(item.city, item.region),
      })) ?? [];

    return Response.json({
      ok: true,
      source: "geodb",
      data: data.length > 0 ? data : toFallbackSuggestions(query),
    });
  } catch {
    return Response.json({
      ok: true,
      source: "fallback",
      data: toFallbackSuggestions(query),
    });
  }
}
