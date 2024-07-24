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
import { useUsers, useDeleteUsers } from "@/hooks/useUsers";
import { SortField, SortOrder } from "@/lib/api/users";
import { Role, User } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";
import EditUserForm from "./Forms/EditUserForm";
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

const roles: Role[] = ["NONE", "SME", "QC", "ADMIN"];

export function UserTable() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    usersToDelete: User[];
  }>({ isOpen: false, usersToDelete: [] });

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
  const deleteUsersMutation = useDeleteUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, role]);

  const handleDeleteSelected = () => {
    const usersToDelete =
      data?.users.filter((user) => selectedUsers.includes(user.id)) || [];
    setDeleteConfirmation({ isOpen: true, usersToDelete });
  };

  const confirmDelete = () => {
    deleteUsersMutation.mutate(selectedUsers, {
      onSuccess: () => {
        setSelectedUsers([]);
        setDeleteConfirmation({ isOpen: false, usersToDelete: [] });
        toast.success("Users deleted successfully");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error deleting users");
      },
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const reset = () => {
    setSelectedUsers([]);
    setSearchTerm("");
    setRole(undefined);
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleCloseEditForm = () => {
    setEditingUser(null);
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
        handleDeleteSelected={handleDeleteSelected}
        selectedUsers={selectedUsers}
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
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        handleEditUser={handleEditUser}
      />

      <UserTablePagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 0}
        perPage={perPage}
      />

      <EditUserForm user={editingUser} onClose={handleCloseEditForm} />
      <DeleteUsersDialog
        confirmDelete={confirmDelete}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />
    </>
  );
}

const UserTableActions = ({
  handleDeleteSelected,
  selectedUsers,
  reset,
  searchTerm,
  setSearchTerm,
  role,
  setRole,
}: {
  handleDeleteSelected: () => void;
  selectedUsers: string[];
  reset: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  role: Role | undefined;
  setRole: (role: Role | undefined) => void;
}) => (
  <div className="mb-4 flex flex-col gap-y-4 md:flex-row justify-between items-center">
    <div className="flex gap-2">
      <Button
        onClick={handleDeleteSelected}
        disabled={selectedUsers.length === 0}
      >
        Delete Selected
      </Button>
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
  selectedUsers,
  setSelectedUsers,
  handleEditUser,
}: {
  handleSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  users: User[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  handleEditUser: (user: User) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">Select</TableHead>
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
        <TableHead
          onClick={() => handleSort("createdAt")}
          className="cursor-pointer"
        >
          Created At{" "}
          {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {!isLoading ? (
        <>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => {
                    setSelectedUsers(
                      checked
                        ? [...selectedUsers, user.id]
                        : selectedUsers.filter((id) => id !== user.id)
                    );
                  }}
                />
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {DateTime.fromJSDate(user.createdAt).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEditUser(user)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
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
