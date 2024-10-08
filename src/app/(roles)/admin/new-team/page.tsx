import CreateTeamForm from "@/components/Forms/CreateTeamForm";
import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <CreateTeamForm />
    </ContentLayout>
  );
}
