import { useQueryClient } from "@tanstack/react-query";
import {
  useListMembers,
  useCreateMember as useGeneratedCreateMember,
  useDeleteMember as useGeneratedDeleteMember,
  getListMembersQueryKey,
} from "@workspace/api-client-react";

export { useListMembers };

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useGeneratedCreateMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
      },
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
      },
    },
  });
}
