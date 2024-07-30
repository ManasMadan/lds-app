"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAdminStatsData } from "@/lib/api/stats";
import { useTheme } from "next-themes";

type ChartDataItem = {
  name: "Pending" | "Reviewed";
  value: number;
};

type ChartConfig = {
  [key in ChartDataItem["name"]]: {
    label: string;
    color: string;
  };
};

export default function AdminHomePageStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => getAdminStatsData(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;
  if (!stats) return <div>No data available</div>;

  const darkMode = useTheme().resolvedTheme === "dark";

  const chartData: ChartDataItem[] = [
    { name: "Pending", value: stats.todayStats.pending },
    { name: "Reviewed", value: stats.todayStats.approved },
  ];

  const chartConfig: ChartConfig = {
    Pending: { label: "Pending", color: "#dc2626" },
    Reviewed: { label: "Reviewed", color: "hsl(120, 100%, 25%)" },
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
      </div>{" "}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart width={300} height={200} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataItem;
                    return (
                      <ChartTooltipContent>
                        <div>{chartConfig[data.name].label}</div>
                        <div className="font-bold">{data.value}</div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill={darkMode ? "#fff" : "#000"} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
