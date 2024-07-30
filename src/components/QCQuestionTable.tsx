"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QuestionSubmittedBy,
  useQuestionsQC,
  useUpdateQuestionStatus,
} from "@/hooks/useQuestions";
import { SortField, SortOrder } from "@/lib/api/questions";
import { Status, Question } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import S3ImageComponent from "./S3ImageComponent";
import { CommentDialog } from "./Forms/CommentDialogForm";

export function QCQuestionTable({
  reviewerId,
  smeId,
}: {
  reviewerId: string;
  smeId?: string;
}) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [commentDialog, setCommentDialog] = useState<{
    isOpen: boolean;
    action: "APPROVED" | "REJECTED";
  }>({ isOpen: false, action: "APPROVED" });

  const perPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data, isLoading } = useQuestionsQC({
    page,
    perPage,
    sortField,
    sortOrder,
    searchTerm: debouncedSearchTerm,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
    status: "PENDING",
    smeId: smeId,
  });

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const updateQuestionStatusMutation = useUpdateQuestionStatus();

  const handleUpdateStatus = (
    status: "APPROVED" | "REJECTED",
    comment: string,
    ids?: string[]
  ) => {
    updateQuestionStatusMutation.mutate(
      {
        questionIds: ids ? ids : selectedQuestions,
        status,
        reviewComment: comment,
        reviewerId: reviewerId,
      },
      {
        onSuccess: () => {
          !ids && setSelectedQuestions([]);
          toast.success(`Questions ${status.toLowerCase()} successfully`);
        },
        onError: (error) => {
          console.error(error);
          toast.error(`Error ${status.toLowerCase()} questions`);
        },
      }
    );
  };

  const openCommentDialog = (action: "APPROVED" | "REJECTED") => {
    setCommentDialog({ isOpen: true, action });
  };

  const closeCommentDialog = () => {
    setCommentDialog({ isOpen: false, action: "APPROVED" });
  };

  const handleCommentConfirm = (comment: string) => {
    handleUpdateStatus(commentDialog.action, comment, selectedQuestions);
    closeCommentDialog();
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, status]);

  const reset = () => {
    setSelectedQuestions([]);
    setSearchTerm("");
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
    setDateRange(undefined);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <QCQuestionTableActions
        handleApproveSelected={() => openCommentDialog("APPROVED")}
        handleRejectSelected={() => openCommentDialog("REJECTED")}
        selectedQuestions={selectedQuestions}
        reset={reset}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <QCQuestionTableData
        handleSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        isLoading={isLoading}
        questions={data?.questions || []}
        selectedQuestions={selectedQuestions}
        setSelectedQuestions={setSelectedQuestions}
        openCommentDialog={openCommentDialog}
      />

      <CommentDialog
        isOpen={commentDialog.isOpen}
        onClose={closeCommentDialog}
        onConfirm={handleCommentConfirm}
        action={commentDialog.action}
      />

      <QCQuestionTablePagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 0}
        perPage={perPage}
      />
    </>
  );
}

const QCQuestionTableActions = ({
  selectedQuestions,
  reset,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  handleApproveSelected,
  handleRejectSelected,
}: {
  selectedQuestions: string[];
  reset: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  handleApproveSelected: () => void;
  handleRejectSelected: () => void;
}) => (
  <div className="mb-4 flex flex-col gap-y-4 md:flex-row justify-between items-center">
    <div className="flex gap-2">
      <Button
        onClick={handleApproveSelected}
        disabled={selectedQuestions.length === 0}
        className="bg-green-500 hover:bg-green-600"
      >
        Approve Selected
      </Button>
      <Button
        onClick={handleRejectSelected}
        disabled={selectedQuestions.length === 0}
        className="bg-red-500 hover:bg-red-600"
      >
        Reject Selected
      </Button>
      <Button onClick={reset}>Reset</Button>
    </div>
    <div className="flex gap-2 flex-col xl:flex-row">
      <div className="flex gap-2">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DateRangePicker
        onUpdate={(values) => setDateRange(values.range)}
        initialDateFrom={dateRange?.from}
        initialDateTo={dateRange?.to}
        align="start"
        locale="en-US"
        showCompare={false}
      />
    </div>
  </div>
);

const QCQuestionTableData = ({
  handleSort,
  sortField,
  sortOrder,
  isLoading,
  questions,
  selectedQuestions,
  setSelectedQuestions,
  openCommentDialog,
}: {
  handleSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  questions: QuestionSubmittedBy[];
  selectedQuestions: string[];
  setSelectedQuestions: (questions: string[]) => void;
  openCommentDialog: (status: "APPROVED" | "REJECTED") => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">Select</TableHead>
        <TableHead>Image</TableHead>
        <TableHead>Submitted By</TableHead>
        <TableHead
          onClick={() => handleSort("status")}
          className="cursor-pointer"
        >
          Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead
          onClick={() => handleSort("createdAt")}
          className="cursor-pointer"
        >
          Submitted At{" "}
          {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Review Comment</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {!isLoading ? (
        <>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                <Checkbox
                  checked={selectedQuestions.includes(question.id)}
                  onCheckedChange={(checked) => {
                    setSelectedQuestions(
                      checked
                        ? [...selectedQuestions, question.id]
                        : selectedQuestions.filter((id) => id !== question.id)
                    );
                  }}
                />
              </TableCell>
              <TableCell>
                <S3ImageComponent url={question.imageS3Key} />
              </TableCell>
              <TableCell>
                {question.submittedBy?.name} ({question.submittedBy?.email})
              </TableCell>
              <TableCell>{question.status}</TableCell>
              <TableCell>
                {DateTime.fromJSDate(question.createdAt).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </TableCell>
              <TableCell>{question.reviewComment || "N/A"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedQuestions([question.id]);
                      openCommentDialog("APPROVED");
                    }}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedQuestions([question.id]);
                      openCommentDialog("REJECTED");
                    }}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </>
      ) : (
        <TableRow>
          <TableCell colSpan={7} className="text-center">
            <Loader />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const QCQuestionTablePagination = ({
  page,
  perPage,
  totalPages,
  setPage,
}: {
  page: number;
  perPage: number;
  totalPages: number;
  setPage: (value: number | ((prevState: number) => number)) => void;
}) => (
  <div className="mt-4 flex flex-col gap-y-4 sm:flex-row justify-between items-center">
    <div>
      Showing {Math.min((page - 1) * perPage + 1, totalPages)} -{" "}
      {Math.min(page * perPage, totalPages)} of {totalPages} questions
    </div>
    <div>
      <Button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Previous
      </Button>
      <span className="mx-2">
        Page {Math.min(page, totalPages)} of {totalPages}
      </span>
      <Button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  </div>
);
