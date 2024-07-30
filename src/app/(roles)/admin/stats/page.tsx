import AllQCStats from "@/components/AllQCStats";
import AllSMEStats from "@/components/AllSMEStats";
import { ContentLayout } from "@/components/layout/content-layout";
import OverallSystemStats from "@/components/OverallSystemStats";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <div className="flex flex-col space-y-4">
        <AllSMEStats />
        <AllQCStats />
        <OverallSystemStats />
      </div>
    </ContentLayout>
  );
}
