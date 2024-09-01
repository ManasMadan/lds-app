// hooks/useTeam.ts
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getTeams, createTeam, fetchTeams, deleteTeams } from "@/lib/api/team";

export function useGetTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams(),
  });
}

export function useTeams({
  page,
  perPage,
  sortField,
  sortOrder,
  searchTerm,
}: any) {
  return useQuery({
    queryKey: ["teams", { page, perPage, sortField, sortOrder, searchTerm }],
    queryFn: () =>
      fetchTeams({ page, perPage, sortField, sortOrder, searchTerm }),
  });
}

export function useDeleteTeams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeams,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
