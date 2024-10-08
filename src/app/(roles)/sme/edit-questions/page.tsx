import { ContentLayout } from "@/components/layout/content-layout";
import { SMEQuestionTable } from "@/components/SMEQuestionTable";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import React from "react";

export default async function page() {
  const session = await getServerSession(authOptions);
  return (
    <ContentLayout title="SME">
      <SMEQuestionTable userId={session?.user.id!} />
    </ContentLayout>
  );
}
