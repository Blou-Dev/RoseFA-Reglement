import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/docs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  const results = (await getSearchIndex())
    .map((item) => {
      const haystack = `${item.title} ${item.description} ${item.section} ${item.content}`.toLowerCase();
      const score = haystack.includes(query) ? 2 : 0;
      const prefix = item.title.toLowerCase().startsWith(query) ? 3 : 0;
      const sectionBoost = item.section.toLowerCase().includes(query) ? 1 : 0;

      return {
        ...item,
        score: score + prefix + sectionBoost,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ score: _score, ...item }) => item);

  return NextResponse.json(results);
}
