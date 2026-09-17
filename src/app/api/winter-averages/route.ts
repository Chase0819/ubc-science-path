import { getWinterSeries } from "@/lib/ubcgrades";

export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codes = searchParams
    .getAll("code")
    .flatMap((value) => value.split(","))
    .map((code) => code.trim())
    .filter(Boolean)
    .slice(0, 24);
  const data = await getWinterSeries(codes);
  return Response.json(data);
}
