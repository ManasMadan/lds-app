import Image from "next/image";
import React from "react";
import Loader from "./Loader";
import { useS3SignedURL } from "@/hooks/useS3";

export default function S3ImageComponent({ url }: { url: string }) {
  const res = useS3SignedURL(url);
  if (res.isError || !res.data) return <div>Error</div>;
  if (res.isLoading)
    return (
      <div className="grid place-items-center w-[100px] aspect-square">
        <Loader />
      </div>
    );
  return <Image src={res.data} alt="Question" width={100} height={100} />;
}
