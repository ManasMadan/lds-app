import { ContentLayout } from "@/components/layout/content-layout";
import { QuestionTable } from "@/components/QuestionsTable";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

export default async function page() {
  const session = await getServerSession(authOptions);
  return (
    <ContentLayout title="QC">
      <QuestionTable
        role={session?.user.role!}
        mandatoryStatus="PENDING"
        reviewerId={session?.user.id}
      />
    </ContentLayout>
  );
}
