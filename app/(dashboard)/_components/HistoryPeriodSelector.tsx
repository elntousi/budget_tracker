"use client";

import { GetHistoryPeriodsResponseType } from '@/app/api/history-periods/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Period, Timeframe } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

interface Props {
  period: Period;
  setPeriod: (period: Period) => void;
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
}

function HistoryPeriodSelector({ period, setPeriod, timeframe, setTimeframe }: Props) {
  const historyPeriods = useQuery<GetHistoryPeriodsResponseType>({
    queryKey: ["overview", "history", "periods"],
    queryFn: () => fetch(`/api/history-periods`).then((res) => res.json()),
  });

  const years: number[] = useMemo(() => {
    if (!historyPeriods.data) return [];
    const collectedYears: number[] = [];
    for (const item of historyPeriods.data) {
      collectedYears.push(item);
    }
    return Array.from(new Set(collectedYears));
  }, [historyPeriods.data]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
        >
          <TabsList className="bg-neutral-900 border border-border rounded-md shadow-md">
            <TabsTrigger value="year" className="data-[state=active]:bg-neutral-800">
              Year
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-neutral-800">
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>

      <div className="flex flex-wrap items-center gap-2">
              <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
                <YearSelector
                  period={period}
                  setPeriod={setPeriod}
                  years={years}
                />
              </SkeletonWrapper>
        {timeframe === "month" && (
          <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
            <MonthSelector period={period} setPeriod={setPeriod} />
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
}

export default HistoryPeriodSelector;

// --- YEAR SELECTOR ---
function YearSelector({
  period,
  setPeriod,
  years,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  years: number[];
}) {
  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) => {
        setPeriod({
          month: period.month,
          year: parseInt(value),
        });
      }}
    >
      <SelectTrigger className="w-[150px] h-9 bg-neutral-900 text-white border border-border rounded-md hover:bg-neutral-800 transition-colors">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-900 border border-border rounded-md shadow-lg text-sm z-50 p-1 animate-in fade-in-0 zoom-in-95">
        {years.map((year) => (
          <SelectItem
            key={year}
            value={year.toString()}
            className="cursor-pointer hover:bg-neutral-800 rounded-md transition-colors"
          >
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// --- MONTH SELECTOR ---
function MonthSelector({
  period,
  setPeriod,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
}) {
  return (
    <Select
      value={period.month.toString()}
      onValueChange={(value) => {
        setPeriod({
          year: period.year,
          month: parseInt(value),
        });
      }}
    >
      <SelectTrigger className="w-[150px] h-9 bg-neutral-900 text-white border border-border rounded-md hover:bg-neutral-800 transition-colors">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-900 border border-border rounded-md shadow-lg text-sm z-50 p-1 animate-in fade-in-0 zoom-in-95">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
          const monthStr = new Date(period.year, month, 1).toLocaleString("default", {
            month: "long",
          });
          return (
            <SelectItem
              key={month}
              value={month.toString()}
              className="cursor-pointer hover:bg-neutral-800 rounded-md transition-colors"
            >
              {monthStr}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
