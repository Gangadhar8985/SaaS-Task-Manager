import { useQueryClient } from "@tanstack/react-query";
import {
  useListProjects,
  useGetProject,
  useCreateProject as useGeneratedCreateProject,
  useUpdateProject as useGeneratedUpdateProject,
  useDeleteProject as useGeneratedDeleteProject,
  getListProjectsQueryKey,
  getGetProjectQueryKey,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@workspace/api-client-react";

export { useListProjects, useGetProject };

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useGeneratedCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      },
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateProject({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(variables.id) });
      },
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      },
    },
  });
}
