import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";
import SMEStats from "@/components/SMEStats";

export default async function page(props: { params: { id: string } }) {
  return (
    <ContentLayout title="SME">
      <SMEStats smeId={props.params.id} />
    </ContentLayout>
  );
}
