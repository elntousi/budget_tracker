"use client";

import { UserSettings } from "@/lib/generated/prisma/client";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";
import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import CountUp from "react-countup";

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

function StatsCards({ from, to, userSettings }: Props) {
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: async () =>
      fetch(
        `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const balance = income - expense;

  return (
    <div className="relative flex w-full flex-wrap gap-4 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Income"
          color="emerald"
          icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={expense}
          title="Expense"
          color="red"
          icon={<TrendingDown className="h-6 w-6 text-red-500" />}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={balance}
          title="Balance"
          color="indigo"
          icon={<Wallet className="h-6 w-6 text-indigo-500" />}
        />
      </SkeletonWrapper>
    </div>
  );
}

export default StatsCards;

function StatCard({
  formatter,
  value,
  title,
  icon,
  color,
}: {
  formatter: Intl.NumberFormat;
  value: number;
  title: string;
  icon: React.ReactNode;
  color: "emerald" | "red" | "indigo";
}) {
  const formatFn = useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  );

  // ✳️ Σταθερά dark background + λεπτό top border με χρώμα
  const colorClasses = {
    emerald:
      "border-t-4 border-emerald-500 bg-neutral-900 text-emerald-400",
    red: "border-t-4 border-red-500 bg-neutral-900 text-red-400",
    indigo: "border-t-4 border-indigo-500 bg-neutral-900 text-indigo-400",
  }[color];

  return (
    <Card
      className={`flex h-24 w-full items-center justify-between rounded-xl p-5 shadow-md transition-all ${colorClasses}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <CountUp
            end={value}
            preserveValue
            redraw={false}
            decimals={2}
            formattingFn={formatFn}
            className="text-xl font-semibold"
          />
        </div>
      </div>
    </Card>
  );
}
