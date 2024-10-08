import { AdminQuestionsTable } from "@/components/AdminQuestionsTable";
import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <AdminQuestionsTable />
    </ContentLayout>
  );
}
