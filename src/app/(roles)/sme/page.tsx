import { ContentLayout } from "@/components/layout/content-layout";
import React from "react";
import { CameraProvider } from "@/components/ui/camera/camera-provider";
import QuestionsUploader from "@/components/QuestionsUploader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SMEHomePageStats from "@/components/SMEHomePageStats";

export default async function page() {
  const userId = (await getServerSession(authOptions))?.user.id as string;
  return (
    <ContentLayout title="SME">
      <div className="flex flex-col gap-4">
        <CameraProvider>
          <QuestionsUploader userId={userId} />
        </CameraProvider>
        <SMEHomePageStats smeId={userId} />
      </div>
    </ContentLayout>
  );
}
