import { ContentLayout } from "@/components/layout/content-layout";
import { UserTable } from "@/components/UserTable";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <UserTable />
    </ContentLayout>
  );
}
