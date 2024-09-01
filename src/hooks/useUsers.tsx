// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  deleteUsers,
  updateUser,
  SortField,
  SortOrder,
  createUser,
} from "@/lib/api/users";
import { Role, User } from "@prisma/client";
import { EditUserFormInputs } from "@/lib/schema";

export function useUsers({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
  role,
  team,
}: {
  page: number;
  perPage: number;
  sortField: SortField;
  sortOrder: SortOrder;
  searchTerm: string;
  role?: Role;
  team?: string;
}) {
  return useQuery({
    queryKey: [
      "users",
      { page, perPage, sortField, sortOrder, searchTerm, role, team },
    ],
    queryFn: () =>
      getUsers({ page, perPage, sortField, sortOrder, searchTerm, role, team }),
  });
}

export function useDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(id, data as EditUserFormInputs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
