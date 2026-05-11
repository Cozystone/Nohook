import { cities } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const segment = cities
    .flatMap((city) => city.segments.map((segment) => ({ city: city.id, ...segment })))
    .find((entry) => entry.id === id);

  if (!segment) {
    return Response.json(
      { ok: false, message: "Segment not found" },
      { status: 404 },
    );
  }

  return Response.json({ ok: true, data: segment });
}
