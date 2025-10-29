"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Period, Timeframe } from "@/lib/types";
import { UserSettings } from "@/prisma/lib/generated/prisma/wasm";
import React, { useMemo, useState, useEffect } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function History({ userSettings }: { userSettings: UserSettings }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [period, setPeriod] = useState<Period>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const historyDataQuery = useQuery({
    queryKey: ["history", "overview", timeframe, period],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`
      ).then((res) => res.json()),
  });

  const dataAvailable =
    historyDataQuery.data &&
    Array.isArray(historyDataQuery.data) &&
    historyDataQuery.data.length > 0;

  return (
    <div className="w-full">
      <h2 className="mt-4 text-3xl font-bold">History</h2>
      <Card className="mt-4 w-full">
        <CardHeader className="gap-2">
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
            <div className="flex h-10 gap-2">
              <Badge variant="outline" className="flex items-center gap-2 text-sm">
                <div className="h-2 w-4 rounded-full bg-emerald-500" />
                Income
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 text-sm">
                <div className="h-2 w-4 rounded-full bg-red-500" />
                Expense
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
            {dataAvailable ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart height={300} data={historyDataQuery.data} barCategoryGap={5}>
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#10B981" stopOpacity={1} />
                      <stop offset="1" stopColor="#10B981" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ef4444" stopOpacity={1} />
                      <stop offset="1" stopColor="#ef4444" stopOpacity={1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="5 5"
                    strokeOpacity={"0.2"}
                    vertical={false}
                  />

                  <XAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 5, right: 5 }}
                    dataKey={(d) => {
                      const { year, month, day } = d;
                      const date = new Date(year, month, day || 1);
                      if (timeframe === "year") {
                        return date.toLocaleString("default", { month: "short" });
                      }
                      return date.toLocaleDateString("default", { day: "2-digit" });
                    }}
                  />

                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    wrapperStyle={{ pointerEvents: "none" }}
                    content={({ active, payload, label }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload}
                        label={label}
                        formatter={formatter}
                      />
                    )}
                  />

                  <Bar
                    dataKey="income"
                    fill="url(#incomeBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey="expense"
                    fill="url(#expenseBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                <p>No data available for the selected period.</p>
                <p className="text-sm text-muted-foreground">
                  Try selecting a different period or add new transactions to see your
                  history here.
                </p>
              </Card>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

export default History;

function CustomTooltip({ active, payload, label, formatter }: { active?: boolean; payload?: Array<{ payload?: { month: number; year: number; expense: number; income: number; day?: number; } }>; label?: string | number; formatter: Intl.NumberFormat; }) {
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (!active || !payload?.length || !payload[0]?.payload) return null;

  const data = payload[0].payload;
  const { income, expense } = data;
  const balance = (income ?? 0) - (expense ?? 0);

  return (
    <div
      className="
        fixed z-50
        rounded-lg
        text-white
        px-4 py-3
        shadow-xl
        border border-neutral-800
        pointer-events-none
        transition-all duration-150 ease-out
        animate-in fade-in-0 zoom-in-95
        backdrop-blur-md bg-[#18181b]/90
      "
      style={{
        left: mouse.x + 16,
        top: mouse.y - 35,
        minWidth: "150px",
      }}
    >
      <p className="mb-2 text-sm text-neutral-400">{label}</p>

      <TooltipRow label="Income" value={income} formatter={formatter} color="emerald" />
      <TooltipRow label="Expense" value={expense} formatter={formatter} color="red" />
      <TooltipRow label="Balance" value={balance} formatter={formatter} color="gray" />
    </div>
  );
}



function TooltipRow({
  label,
  value,
  formatter,
  color,
}: {
  label: string;
  value: number;
  formatter: Intl.NumberFormat;
  color: "emerald" | "red" | "cyan" | "gray";
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500 text-emerald-400",
    red: "bg-red-500 text-red-400",
    cyan: "bg-cyan-500 text-cyan-400",
    gray: "bg-gray-100 text-foreground",
  };

  const colorClass = colorMap[color];

  return (
    <div className="flex items-center justify-between gap-3 mb-1">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${colorClass}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${colorClass.replace("bg-", "text-")}`}>
        {formatter.format(value)}
      </span>
    </div>
  );
}
