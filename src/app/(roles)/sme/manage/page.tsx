import { ContentLayout } from "@/components/layout/content-layout";
import { QuestionTable } from "@/components/QuestionsTable";
import React from "react";

export default async function page() {
  return (
    <ContentLayout title="SME">
      <QuestionTable />
    </ContentLayout>
  );
}
