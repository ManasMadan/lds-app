import { useQuery } from "@tanstack/react-query";
import { getSignedUrlFromS3 } from "@/lib/api/s3";

export function useS3SignedURL(url: string) {
  return useQuery({
    queryKey: ["s3", { url }],
    queryFn: () => getSignedUrlFromS3(url),
  });
}
