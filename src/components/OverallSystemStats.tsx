"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOverallSystemStats } from "@/lib/api/stats";
import Link from "next/link";
import { Button } from "./ui/button";

export default function OverallSystemStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["overallSystemStats"],
    queryFn: () => fetchOverallSystemStats(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;
  if (!data) return <div>Error</div>;

  return (
    <div className="space-y-4">
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
                {data.totalQuestionsSubmitted}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Overall Approval Rate</h3>
              <p className="text-3xl font-bold">
                {(data.approvalRate * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Overall Rejection Rate</h3>
              <p className="text-3xl font-bold">
                {(data.rejectionRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Top SMEs</h3>
              <ol className="space-y-4">
                {data.topPerformers.sme.map((sme, index) => (
                  <li key={index} className="p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{sme.name}</p>
                        <p className="text-sm text-gray-600">{sme.email}</p>
                        <p className="text-sm">
                          {sme.questionsSubmitted} questions submitted
                        </p>
                      </div>
                      <Link
                        href={`/admin/stats/by-user/SME/${sme.id}`}
                        passHref
                      >
                        <Button variant="outline" size="sm">
                          Detailed Report
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Top QCs</h3>
              <ol className="space-y-4">
                {data.topPerformers.qc.map((qc, index) => (
                  <li key={index} className="p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{qc.name}</p>
                        <p className="text-sm text-gray-600">{qc.email}</p>
                        <p className="text-sm">
                          {qc.questionsReviewed} questions reviewed
                        </p>
                      </div>
                      <Link href={`/admin/stats/by-user/QC/${qc.id}`} passHref>
                        <Button variant="outline" size="sm">
                          Detailed Report
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
