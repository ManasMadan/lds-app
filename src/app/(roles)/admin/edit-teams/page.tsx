import { ContentLayout } from "@/components/layout/content-layout";
import { TeamTable } from "@/components/TeamTable";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <TeamTable />
    </ContentLayout>
  );
}
