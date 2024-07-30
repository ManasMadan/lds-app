import { AdminUserStatsTable } from "@/components/AdminUserStatsTable";
import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <AdminUserStatsTable />
    </ContentLayout>
  );
}
