import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import z from "zod";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  year: z.coerce.number().min(2000).max(3000),   // ✅ Επιτρέπει κανονικά έτη
  month: z.coerce.number().min(0).max(11),       // ✅ Μήνες 0–11 (όπως JS Date)
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const queryParams = getHistoryDataSchema.safeParse({
    timeframe,
    year,
    month,
  });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const data = await getHistoryData(
    user.id,
    queryParams.data.timeframe,
    { year: queryParams.data.year, month: queryParams.data.month }
  );

  return Response.json(data);
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

async function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {
  switch (timeframe) {
    case "year":
      return await getYearHistoryData(userId, period.year);
    case "month":
      return await getMonthHistoryData(userId, period.year, period.month);
  }
}

type HistoryData = {
  month: number;
  year: number;
  expense: number;
  income: number;
  day?: number;
};

async function getYearHistoryData(userId: string, year: number) {
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId,
      year,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: [{ month: "asc" }],
  });

  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];

  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;

    const monthData = result.find((row: { month: number; _sum: { expense: number | null; income: number | null; } }) => row.month === i);
    if (monthData) {
      expense = monthData._sum.expense || 0;
      income = monthData._sum.income || 0;
    }

    history.push({
      month: i,
      year,
      expense,
      income,
    });
  }

  return history;
}

async function getMonthHistoryData(userId: string, year: number, month: number) {
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId,
      year,
      month,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: [{ day: "asc" }],
  });

  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  for (let i = 1; i <= daysInMonth; i++) {
    let expense = 0;
    let income = 0;

    const dayData = result.find((row: { day: number; _sum: { expense: number | null; income: number | null; } }) => row.day === i);
    if (dayData) {
      expense = dayData._sum.expense || 0;
      income = dayData._sum.income || 0;
    }

    history.push({
      day: i,
      month,
      year,
      expense,
      income,
    });
  }

  return history;
}
