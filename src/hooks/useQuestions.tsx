import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  getQuestions,
  deleteQuestions,
  uploadQuestions,
  SortField,
  SortOrder,
} from "@/lib/api/questions";
import { Status } from "@prisma/client";

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

export function useQuestions({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
  status,
  dateFrom,
  dateTo,
}: {
  page: number;
  perPage: number;
  sortField: SortField;
  sortOrder: SortOrder;
  searchTerm: string;
  status: Status | undefined;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}) {
  return useQuery({
    queryKey: [
      "questions",
      {
        page,
        perPage,
        sortField,
        sortOrder,
        searchTerm,
        status,
        dateFrom,
        dateTo,
      },
    ],
    queryFn: () =>
      getQuestions({
        page,
        perPage,
        sortField,
        sortOrder,
        searchTerm,
        status,
        dateFrom,
        dateTo,
      }),
  });
}

export function useDeleteQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
