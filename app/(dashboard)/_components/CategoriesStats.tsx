"use client";

import { GetCategoriesStatsResponseType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress"; // ✅ Προσθήκη για το progress bar
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@/prisma/lib/generated/prisma/wasm";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

function CategoriesStats({ userSettings, from, to }: Props) {
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ["overview", "categories", "stats", from, to],
    queryFn: async () => {
      const res = await fetch(
        `/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      );
      if (!res.ok) throw new Error("Failed to fetch categories stats");
      return res.json();
    },
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          data={statsQuery.data || []}
          type="income"
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          data={statsQuery.data || []}
          type="expense"
        />
      </SkeletonWrapper>
    </div>
  );
}

function CategoriesCard({
  formatter,
  data,
  type,
}: {
  formatter: Intl.NumberFormat;
  data: GetCategoriesStatsResponseType;
  type: TransactionType;
}) {
  const filteredData = data.filter(
    (el: { type: string; _sum: { amount: number | null } }) => el.type === type
  );

  const total = filteredData.reduce(    (acc: number, el: { _sum: { amount: number | null } }) => acc + (el._sum?.amount || 0),
    0
  );

  return (
    <Card className="h-80 w-full col-span-6">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          {type === "income" ? "Income by Category" : "Expense by Category"}
        </CardTitle>
      </CardHeader>

      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for the selected period.
            <p className="text-sm text-muted-foreground">
              Try selecting a different period or try adding new{" "}
              {type === "income" ? "incomes" : "expenses"}.
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
          <ScrollArea className="h-60 w-full px-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map((item: { category: string | null; categoryIcon: string | null; _sum: { amount: number | null } }) => {
                const amount = item._sum.amount || 0;
                const percentage = (amount * 100) / (total || amount);

                return (
                  <div
                    key={item.category}
                    className="flex flex-col gap-2"
                  >
                    {/* Επικεφαλίδα κάθε κατηγορίας */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-400">
                        {item.categoryIcon} {item.category}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </span>

                      <span className="text-sm text-gray-400">
                        {formatter.format(amount)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <Progress
                      value={percentage}
                      className={`h-2 transition-all duration-700 ease-in-out ${
                        type === "income"
                          ? "bg-emerald-950 [&>div]:bg-emerald-500"
                          : "bg-rose-950 [&>div]:bg-rose-500"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}

export default CategoriesStats;
