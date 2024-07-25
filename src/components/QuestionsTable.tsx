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
  useQuestions,
  useDeleteQuestions,
  useUpdateQuestionStatus,
} from "@/hooks/useQuestions";
import { SortField, SortOrder } from "@/lib/api/questions";
import { Status, Question, Role } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "./Loader";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DateTime } from "luxon";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import S3ImageComponent from "./S3ImageComponent";
import { CommentDialog } from "./Forms/CommentDialogForm";

const statuses: Status[] = ["PENDING", "APPROVED", "REJECTED"];

export function QuestionTable({
  userId,
  role,
  mandatoryStatus,
  reviewerId,
}: {
  userId?: string;
  reviewerId?: string;
  role: Role;
  mandatoryStatus?: Status;
}) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<Status | undefined>(mandatoryStatus);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    questionsToDelete: Question[];
  }>({ isOpen: false, questionsToDelete: [] });
  const [commentDialog, setCommentDialog] = useState<{
    isOpen: boolean;
    action: "APPROVED" | "REJECTED";
  }>({ isOpen: false, action: "APPROVED" });

  const perPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data, isLoading } = useQuestions({
    page,
    perPage,
    sortField,
    sortOrder,
    searchTerm: debouncedSearchTerm,
    status,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
    submittedById: userId,
  });

  const deleteQuestionsMutation = useDeleteQuestions();
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
        reviewerId: reviewerId!,
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

  const handleDeleteSelected = () => {
    const questionsToDelete =
      data?.questions.filter((question) =>
        selectedQuestions.includes(question.id)
      ) || [];
    setDeleteConfirmation({ isOpen: true, questionsToDelete });
  };

  const confirmDelete = () => {
    deleteQuestionsMutation.mutate(selectedQuestions, {
      onSuccess: () => {
        setSelectedQuestions([]);
        setDeleteConfirmation({ isOpen: false, questionsToDelete: [] });
        toast.success("Questions deleted successfully");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error deleting questions");
      },
    });
  };

  const reset = () => {
    setSelectedQuestions([]);
    setSearchTerm("");
    setStatus(mandatoryStatus);
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
      <QuestionTableActions
        mandatoryStatus={mandatoryStatus}
        role={role}
        handleDeleteSelected={handleDeleteSelected}
        handleApproveSelected={() => openCommentDialog("APPROVED")}
        handleRejectSelected={() => openCommentDialog("REJECTED")}
        selectedQuestions={selectedQuestions}
        reset={reset}
        searchTerm={searchTerm}
        setStatus={setStatus}
        status={status}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <QuestionTableData
        mandatoryStatus={mandatoryStatus}
        role={role}
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

      <QuestionTablePagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 0}
        perPage={perPage}
      />

      <DeleteQuestionsDialog
        confirmDelete={confirmDelete}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />
    </>
  );
}

const QuestionTableActions = ({
  handleDeleteSelected,
  selectedQuestions,
  reset,
  searchTerm,
  setSearchTerm,
  status,
  setStatus,
  mandatoryStatus,
  dateRange,
  setDateRange,
  handleApproveSelected,
  handleRejectSelected,
  role,
}: {
  handleDeleteSelected: () => void;
  selectedQuestions: string[];
  reset: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  status: Status | undefined;
  setStatus: (status: Status | undefined) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  role: Role;
  handleApproveSelected: () => void;
  mandatoryStatus: Status | undefined;
  handleRejectSelected: () => void;
}) => (
  <div className="mb-4 flex flex-col gap-y-4 md:flex-row justify-between items-center">
    <div className="flex gap-2">
      {role === "SME" ? (
        <Button
          onClick={handleDeleteSelected}
          disabled={selectedQuestions.length === 0}
        >
          Delete Selected
        </Button>
      ) : null}
      {role === "QC" ? (
        <>
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
        </>
      ) : null}
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
        {!mandatoryStatus ? (
          <Select
            value={status}
            onValueChange={(value: string) => {
              if (value === "ALL") {
                setStatus(undefined);
              } else {
                setStatus(value as Status);
              }
            }}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
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

const QuestionTableData = ({
  handleSort,
  sortField,
  sortOrder,
  isLoading,
  questions,
  selectedQuestions,
  setSelectedQuestions,
  role,
  openCommentDialog,
  mandatoryStatus,
}: {
  handleSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  questions: Question[];
  selectedQuestions: string[];
  setSelectedQuestions: (questions: string[]) => void;
  role: Role;
  openCommentDialog: (status: "APPROVED" | "REJECTED") => void;
  mandatoryStatus: Status | undefined;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">Select</TableHead>
        <TableHead>Image</TableHead>
        {!mandatoryStatus ? (
          <TableHead
            onClick={() => handleSort("status")}
            className="cursor-pointer"
          >
            Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
          </TableHead>
        ) : null}
        <TableHead
          onClick={() => handleSort("createdAt")}
          className="cursor-pointer"
        >
          Submitted At{" "}
          {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Review Comment</TableHead>
        {role === "QC" && <TableHead>Actions</TableHead>}
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
              {!mandatoryStatus ? (
                <TableCell>{question.status}</TableCell>
              ) : null}
              <TableCell>
                {DateTime.fromJSDate(question.createdAt).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </TableCell>
              <TableCell>{question.reviewComment || "N/A"}</TableCell>
              {role === "QC" && (
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
              )}
            </TableRow>
          ))}
        </>
      ) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            <Loader />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const QuestionTablePagination = ({
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

const DeleteQuestionsDialog = ({
  deleteConfirmation,
  setDeleteConfirmation,
  confirmDelete,
}: {
  deleteConfirmation: {
    isOpen: boolean;
    questionsToDelete: Question[];
  };
  setDeleteConfirmation: (
    value:
      | {
          isOpen: boolean;
          questionsToDelete: Question[];
        }
      | ((prevState: { isOpen: boolean; questionsToDelete: Question[] }) => {
          isOpen: boolean;
          questionsToDelete: Question[];
        })
  ) => void;
  confirmDelete: () => void;
}) => {
  return (
    <Dialog
      open={deleteConfirmation.isOpen}
      onOpenChange={() =>
        setDeleteConfirmation({ isOpen: false, questionsToDelete: [] })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the selected questions?</p>
        <p>
          Number of questions to delete:{" "}
          {deleteConfirmation.questionsToDelete.length}
        </p>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            onClick={() =>
              setDeleteConfirmation({ isOpen: false, questionsToDelete: [] })
            }
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
