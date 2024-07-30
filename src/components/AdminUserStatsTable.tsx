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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { SortField, SortOrder } from "@/lib/api/users";
import { Role, User } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "./Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DateTime } from "luxon";
import Link from "next/link";

const roles: Role[] = ["NONE", "SME", "QC", "ADMIN"];

export function AdminUserStatsTable() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState<Role | undefined>(undefined);

  const perPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const { data, isLoading } = useUsers({
    page,
    perPage,
    sortField,
    sortOrder,
    searchTerm: debouncedSearchTerm,
    role,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, role]);

  const reset = () => {
    setSearchTerm("");
    setRole(undefined);
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
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
      <UserTableActions
        reset={reset}
        searchTerm={searchTerm}
        setRole={setRole}
        role={role}
        setSearchTerm={setSearchTerm}
      />

      <UserTableData
        handleSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        isLoading={isLoading}
        users={data?.users || []}
      />

      <UserTablePagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 0}
        perPage={perPage}
      />
    </>
  );
}

const UserTableActions = ({
  reset,
  searchTerm,
  setSearchTerm,
  role,
  setRole,
}: {
  reset: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  role: Role | undefined;
  setRole: (role: Role | undefined) => void;
}) => (
  <div className="mb-4 flex flex-col gap-y-4 md:flex-row justify-between items-center">
    <div className="flex gap-2">
      <Button onClick={reset}>Reset</Button>
    </div>
    <div className="flex gap-2">
      <Input
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select
        value={role}
        onValueChange={(value: string) => {
          if (value === "ALL") {
            setRole(undefined);
          } else {
            setRole(value as Role);
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const UserTableData = ({
  handleSort,
  sortField,
  sortOrder,
  isLoading,
  users,
}: {
  handleSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  users: User[];
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead
          onClick={() => handleSort("name")}
          className="cursor-pointer"
        >
          Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead
          onClick={() => handleSort("email")}
          className="cursor-pointer"
        >
          Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead
          onClick={() => handleSort("role")}
          className="cursor-pointer"
        >
          Role {sortField === "role" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {!isLoading ? (
        <>
          {users.map(
            (user) =>
              (user.role === "QC" || user.role === "SME") && (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button asChild>
                      <Link
                        href={`/admin/stats/by-user/${user.role}/${user.id}`}
                      >
                        View Report
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
          )}
        </>
      ) : (
        <TableRow>
          <TableCell colSpan={6} className="text-center">
            <Loader />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const UserTablePagination = ({
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
      {Math.min(page * perPage, totalPages)} of {totalPages} users
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

const DeleteUsersDialog = ({
  deleteConfirmation,
  setDeleteConfirmation,
  confirmDelete,
}: {
  deleteConfirmation: {
    isOpen: boolean;
    usersToDelete: User[];
  };
  setDeleteConfirmation: (
    value:
      | {
          isOpen: boolean;
          usersToDelete: User[];
        }
      | ((prevState: { isOpen: boolean; usersToDelete: User[] }) => {
          isOpen: boolean;
          usersToDelete: User[];
        })
  ) => void;
  confirmDelete: () => void;
}) => {
  return (
    <Dialog
      open={deleteConfirmation.isOpen}
      onOpenChange={() =>
        setDeleteConfirmation({ isOpen: false, usersToDelete: [] })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the following users?</p>
        <ul className="list-disc list-inside my-4">
          {deleteConfirmation.usersToDelete.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            onClick={() =>
              setDeleteConfirmation({ isOpen: false, usersToDelete: [] })
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
