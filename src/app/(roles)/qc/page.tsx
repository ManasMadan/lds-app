import { ContentLayout } from "@/components/layout/content-layout";
import QCHomePageStats from "@/components/QCHomePageStats";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function page() {
  const userId = (await getServerSession(authOptions))?.user.id as string;

  return (
    <ContentLayout title="QC">
      <QCHomePageStats qcId={userId} />
    </ContentLayout>
  );
}
