"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchSMEStats } from "@/lib/api/stats";

export default function SMEStats({ smeId }: { smeId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["smeStats", smeId],
    queryFn: () => fetchSMEStats(smeId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;
  if (!data) return <div>Error</div>;

  const renderPerformanceChart = (
    data: any[],
    dataKeys: string[],
    xAxisKey: string
  ) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        {dataKeys.map((key, index) => (
          <Bar key={key} dataKey={key} fill={`hsl(${index * 120}, 70%, 50%)`} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              {renderPerformanceChart(
                data.dailyStats,
                [
                  "questionsSubmitted",
                  "questionsApproved",
                  "questionsRejected",
                ],
                "date"
              )}
            </TabsContent>
            <TabsContent value="weekly">
              {renderPerformanceChart(
                data.weeklyStats,
                [
                  "questionsSubmitted",
                  "questionsApproved",
                  "questionsRejected",
                ],
                "week"
              )}
            </TabsContent>
            <TabsContent value="monthly">
              {renderPerformanceChart(
                data.monthlyStats,
                [
                  "questionsSubmitted",
                  "questionsApproved",
                  "questionsRejected",
                ],
                "month"
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SME Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                Total Questions Submitted
              </h3>
              <p className="text-3xl font-bold">
                {data.smePerformance.totalQuestionsSubmitted}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Approval Rate</h3>
              <p className="text-3xl font-bold">
                {(data.smePerformance.approvalRate * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Rejection Rate</h3>
              <p className="text-3xl font-bold">
                {(data.smePerformance.rejectionRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                Total Questions Submitted
              </h3>
              <p className="text-3xl font-bold">
                {data.systemStats.totalQuestionsSubmitted}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Overall Approval Rate</h3>
              <p className="text-3xl font-bold">
                {(data.systemStats.approvalRate * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Overall Rejection Rate</h3>
              <p className="text-3xl font-bold">
                {(data.systemStats.rejectionRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
