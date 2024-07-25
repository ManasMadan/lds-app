import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadQuestions } from "@/lib/api/questions";

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { images: string[]; userId: string }) =>
      uploadQuestions(params.images, params.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
