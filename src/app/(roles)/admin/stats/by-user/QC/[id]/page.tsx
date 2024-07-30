import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QCStats from "@/components/QCStats";

export default async function page(props: { params: { id: string } }) {
  return (
    <ContentLayout title="SME">
      <QCStats qcId={props.params.id} />
    </ContentLayout>
  );
}
