import CreateUserForm from "@/components/Forms/CreateUserForm";
import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";

export default function page() {
  return (
    <ContentLayout title="Admin">
      <CreateUserForm />
    </ContentLayout>
  );
}
