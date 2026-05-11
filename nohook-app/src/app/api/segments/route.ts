import { cities } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("city");

  const payload = cityId ? cities.find((city) => city.id === cityId) : cities;

  if (!payload) {
    return Response.json({ ok: false, message: "City not found" }, { status: 404 });
  }

  return Response.json({ ok: true, data: payload });
}
