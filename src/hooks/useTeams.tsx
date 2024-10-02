// hooks/useTeam.ts
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getTeams, createTeam, fetchTeams, deleteTeams } from "@/lib/api/team";

export function useGetTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams(),
  });
}

/*************  ✨ Codeium Command ⭐  *************/
/**
 * Fetches teams from the API and stores them in the React Query cache.
 *
 * The results are paginated, and the cache key is based on the pagination
 * parameters and any search terms.
 *
 * @param {Object} options An object containing the following properties:
 * - page: The page of results to fetch. Defaults to 1.
 * - perPage: The number of results to fetch per page. Defaults to 10.
 * - sortField: The field to sort the results by. Defaults to 'name'.
 * - sortOrder: The order to sort the results in. Defaults to 'asc'.
 * - searchTerm: A search term to filter the results by. Defaults to ''.
 *
 * @returns {UseQueryResult} An object containing the query results and other
 * information about the query.
 */
/******  cea7180c-55dc-4e7a-b649-8c707861f069  *******/ export function useTeams({
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
