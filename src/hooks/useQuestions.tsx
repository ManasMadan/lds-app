import {
  useMutation,
  useQueryClient,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  getQuestions,
  deleteQuestions,
  uploadQuestions,
  SortField,
  SortOrder,
  updateQuestionStatus,
} from "@/lib/api/questions";
import { Status } from "@prisma/client";

type SubmittedBy = {
  name: string;
  email: string;
};

export type QuestionSubmittedBy = {
  id: string;
  imageS3Key: string;
  status: Status;
  createdAt: Date;
  reviewComment: string | null;
  submittedBy?: SubmittedBy;
};

type QuestionsSubmittedByResponse = {
  questions: QuestionSubmittedBy[];
  totalCount: number;
  totalPages: number;
};

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

export function useQuestionsSME({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
  status,
  dateFrom,
  dateTo,
  submittedById,
}: {
  page: number;
  perPage: number;
  sortField: SortField;
  sortOrder: SortOrder;
  searchTerm: string;
  status: Status | undefined;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  submittedById: string | undefined;
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
        submittedById,
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
        submittedById,
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

export function useUpdateQuestionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionIds,
      status,
      reviewComment,
      reviewerId,
    }: {
      questionIds: string[];
      status: "APPROVED" | "REJECTED";
      reviewComment: string;
      reviewerId: string;
    }) => updateQuestionStatus(questionIds, status, reviewComment, reviewerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useQuestionsQC({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
  dateFrom,
  dateTo,
  reviewedById,
  status,
  smeId,
}: {
  page: number;
  perPage: number;
  sortField: SortField;
  sortOrder: SortOrder;
  searchTerm: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  reviewedById?: string;
  status: Status;
  smeId?: string;
}): UseQueryResult<QuestionsSubmittedByResponse, Error> {
  return useQuery<QuestionsSubmittedByResponse, Error>({
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
        includeSmeInfo: true,
        reviewedById,
        smeId,
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
        submittedById: smeId,
        includeSmeInfo: true,
        reviewedById,
      }) as Promise<QuestionsSubmittedByResponse>,
  });
}
