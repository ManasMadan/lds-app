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

export function useUsers({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
  role,
}: {
  page: number;
  perPage: number;
  sortField: SortField;
  sortOrder: SortOrder;
  searchTerm: string;
  role?: Role;
}) {
  return useQuery({
    queryKey: [
      "users",
      { page, perPage, sortField, sortOrder, searchTerm, role },
    ],
    queryFn: () =>
      getUsers({ page, perPage, sortField, sortOrder, searchTerm, role }),
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
      updateUser(id, data),
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
