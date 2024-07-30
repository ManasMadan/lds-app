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
import { useAdminQuestions, useDeleteQuestions } from "@/hooks/useQuestions";
import { SortField, SortOrder } from "@/lib/api/questions";
import { Status } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import S3ImageComponent from "./S3ImageComponent";

const statuses: Status[] = ["PENDING", "APPROVED", "REJECTED"];

export function AdminQuestionsTable() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const perPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const { data, isLoading } = useAdminQuestions({
    page,
    perPage,
    sortField,
    sortOrder,
    searchTerm: debouncedSearchTerm,
    status,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
    submittedById: undefined,
    reviewedById: undefined,
  });

  const deleteQuestionsMutation = useDeleteQuestions();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, status, dateRange]);

  const handleDeleteSelected = () => {
    if (selectedQuestions.length === 0) return;

    deleteQuestionsMutation.mutate(selectedQuestions, {
      onSuccess: () => {
        setSelectedQuestions([]);
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
    setStatus(undefined);
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
      <AdminQuestionsTableActions
        handleDeleteSelected={handleDeleteSelected}
        selectedQuestions={selectedQuestions}
        reset={reset}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        status={status}
        setStatus={setStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <AdminQuestionsTableData
        handleSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        isLoading={isLoading}
        questions={data?.questions || []}
        selectedQuestions={selectedQuestions}
        setSelectedQuestions={setSelectedQuestions}
      />

      <AdminQuestionsTablePagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 0}
        perPage={perPage}
      />
    </>
  );
}

const AdminQuestionsTableActions = ({
  handleDeleteSelected,
  selectedQuestions,
  reset,
  searchTerm,
  setSearchTerm,
  status,
  setStatus,
  dateRange,
  setDateRange,
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
}) => (
  <div className="mb-4 flex flex-col gap-y-4 md:flex-row justify-between items-center">
    <div className="flex gap-2">
      <Button
        onClick={handleDeleteSelected}
        disabled={selectedQuestions.length === 0}
      >
        Delete Selected
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

const AdminQuestionsTableData = ({
  handleSort,
  sortField,
  sortOrder,
  isLoading,
  questions,
  selectedQuestions,
  setSelectedQuestions,
}: {
  handleSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  questions: any[];
  selectedQuestions: string[];
  setSelectedQuestions: (questions: string[]) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">Select</TableHead>
        <TableHead>Image</TableHead>
        <TableHead
          onClick={() => handleSort("status")}
          className="cursor-pointer"
        >
          Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Submitted By</TableHead>
        <TableHead>Reviewed By</TableHead>
        <TableHead
          onClick={() => handleSort("createdAt")}
          className="cursor-pointer"
        >
          Submitted At{" "}
          {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Review Comment</TableHead>
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
              <TableCell>{question.status}</TableCell>
              <TableCell>
                {question.submittedBy?.name} ({question.submittedBy?.email})
              </TableCell>
              <TableCell>
                {question.reviewedBy
                  ? `${question.reviewedBy.name} (${question.reviewedBy.email})`
                  : "N/A"}
              </TableCell>
              <TableCell>
                {DateTime.fromJSDate(question.createdAt).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </TableCell>
              <TableCell>{question.reviewComment || "N/A"}</TableCell>
            </TableRow>
          ))}
        </>
      ) : (
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            <Loader />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const AdminQuestionsTablePagination = ({
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
  <div className="mt-4 flex justify-between items-center">
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
