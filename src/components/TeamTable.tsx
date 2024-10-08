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
import { useTeams, useDeleteTeams } from "@/hooks/useTeams";
import { Team } from "@prisma/client";
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
import EditTeamForm from "./Forms/EditTeamForm";

export function TeamTable() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<"name" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    teamsToDelete: Team[];
  }>({ isOpen: false, teamsToDelete: [] });

  const perPage = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const { data, isLoading } = useTeams({
    page,
    perPage,
    sortField,
    sortOrder,
    searchTerm: debouncedSearchTerm,
  });
  const deleteTeamsMutation = useDeleteTeams();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const handleDeleteSelected = () => {
    const teamsToDelete =
      data?.teams.filter((team) => selectedTeams.includes(team.id)) || [];
    setDeleteConfirmation({ isOpen: true, teamsToDelete });
  };

  const confirmDelete = () => {
    deleteTeamsMutation.mutate(selectedTeams, {
      onSuccess: () => {
        setSelectedTeams([]);
        setDeleteConfirmation({ isOpen: false, teamsToDelete: [] });
        toast.success("Teams deleted successfully");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error deleting teams");
      },
    });
  };

  const reset = () => {
    setSelectedTeams([]);
    setSearchTerm("");
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSort = (field: "name" | "createdAt") => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
  };
  const handleCloseEditForm = () => {
    setEditingTeam(null);
  };

  return (
    <>
      <TeamTableActions
        handleDeleteSelected={handleDeleteSelected}
        selectedTeams={selectedTeams}
        reset={reset}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <TeamTableData
        handleSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        isLoading={isLoading}
        teams={data?.teams || []}
        selectedTeams={selectedTeams}
        setSelectedTeams={setSelectedTeams}
        handleEditTeam={handleEditTeam}
      />

      <TeamTablePagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 0}
        perPage={perPage}
      />
      <EditTeamForm team={editingTeam} onClose={handleCloseEditForm} />

      <DeleteTeamsDialog
        confirmDelete={confirmDelete}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />
    </>
  );
}

const TeamTableActions = ({
  handleDeleteSelected,
  selectedTeams,
  reset,
  searchTerm,
  setSearchTerm,
}: {
  handleDeleteSelected: () => void;
  selectedTeams: string[];
  reset: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) => (
  <div className="mb-4 flex flex-col gap-y-4 md:flex-row justify-between items-center">
    <div className="flex gap-2">
      <Button
        onClick={handleDeleteSelected}
        disabled={selectedTeams.length === 0}
      >
        Delete Selected
      </Button>
      <Button onClick={reset}>Reset</Button>
    </div>
    <div className="flex gap-2">
      <Input
        placeholder="Search by team name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
    </div>
  </div>
);

const TeamTableData = ({
  handleSort,
  sortField,
  sortOrder,
  isLoading,
  teams,
  selectedTeams,
  setSelectedTeams,
  handleEditTeam,
}: {
  handleSort: (field: "name" | "createdAt") => void;
  sortField: "name" | "createdAt";
  sortOrder: "asc" | "desc";
  isLoading: boolean;
  teams: Team[];
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
  handleEditTeam: (team: Team) => void;
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
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTeams.includes(team.id)}
                  onCheckedChange={(checked) => {
                    setSelectedTeams(
                      checked
                        ? [...selectedTeams, team.id]
                        : selectedTeams.filter((id) => id !== team.id)
                    );
                  }}
                />
              </TableCell>
              <TableCell>{team.name}</TableCell>
              <TableCell>
                {DateTime.fromJSDate(team.createdAt).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEditTeam(team)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </>
      ) : (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            <Loader />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const TeamTablePagination = ({
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
      {Math.min(page * perPage, totalPages)} of {totalPages} teams
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

const DeleteTeamsDialog = ({
  deleteConfirmation,
  setDeleteConfirmation,
  confirmDelete,
}: {
  deleteConfirmation: {
    isOpen: boolean;
    teamsToDelete: Team[];
  };
  setDeleteConfirmation: (
    value:
      | {
          isOpen: boolean;
          teamsToDelete: Team[];
        }
      | ((prevState: { isOpen: boolean; teamsToDelete: Team[] }) => {
          isOpen: boolean;
          teamsToDelete: Team[];
        })
  ) => void;
  confirmDelete: () => void;
}) => {
  return (
    <Dialog
      open={deleteConfirmation.isOpen}
      onOpenChange={() =>
        setDeleteConfirmation({ isOpen: false, teamsToDelete: [] })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the following teams?</p>
        <ul className="list-disc list-inside my-4">
          {deleteConfirmation.teamsToDelete.map((team) => (
            <li key={team.id}>{team.name}</li>
          ))}
        </ul>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            onClick={() =>
              setDeleteConfirmation({ isOpen: false, teamsToDelete: [] })
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
