import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QCStats from "@/components/QCStats";

export default async function page() {
  const userId = (await getServerSession(authOptions))?.user.id as string;
  return (
    <ContentLayout title="SME">
      <QCStats qcId={userId} />
    </ContentLayout>
  );
}
