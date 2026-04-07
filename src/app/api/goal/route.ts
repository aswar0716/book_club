import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
  const goal = await db.readingGoal.findUnique({ where: { year } });
  return NextResponse.json(goal ?? null);
}

export async function POST(req: NextRequest) {
  const { year, target }: { year: number; target: number } = await req.json();
  const goal = await db.readingGoal.upsert({
    where:  { year },
    create: { year, target },
    update: { target },
  });
  return NextResponse.json(goal);
}
