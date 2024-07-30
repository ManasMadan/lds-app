import AdminHomePageStats from "@/components/AdminHomePageStats";
import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <AdminHomePageStats />
    </ContentLayout>
  );
}
