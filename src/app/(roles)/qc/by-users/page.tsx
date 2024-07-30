import { ContentLayout } from "@/components/layout/content-layout";
import { QCUserTable } from "@/components/QCUserTable";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <QCUserTable />
    </ContentLayout>
  );
}
