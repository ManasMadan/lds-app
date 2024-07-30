import { ContentLayout } from "@/components/layout/content-layout";
import { QCMyQuestionTable } from "@/components/QCMyQuestionTable";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

export default async function page() {
  const session = await getServerSession(authOptions);
  return (
    <ContentLayout title="QC">
      <QCMyQuestionTable reviewerId={session?.user.id!} />
    </ContentLayout>
  );
}
