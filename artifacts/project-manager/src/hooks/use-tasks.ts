import { useQueryClient } from "@tanstack/react-query";
import {
  useListTasks,
  useGetTask,
  useListProjectTasks,
  useCreateTask as useGeneratedCreateTask,
  useUpdateTask as useGeneratedUpdateTask,
  useDeleteTask as useGeneratedDeleteTask,
  getListTasksQueryKey,
  getGetTaskQueryKey,
  getListProjectTasksQueryKey,
} from "@workspace/api-client-react";

export { useListTasks, useGetTask, useListProjectTasks };

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useGeneratedCreateTask({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        if (variables.data.projectId) {
          queryClient.invalidateQueries({ queryKey: getListProjectTasksQueryKey(variables.data.projectId) });
        }
      },
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateTask({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(variables.id) });
        if (data.projectId) {
          queryClient.invalidateQueries({ queryKey: getListProjectTasksQueryKey(data.projectId) });
        }
      },
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteTask({
    mutation: {
      onSuccess: () => {
        // Broad invalidation since we don't have the task data in delete response
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] }); 
      },
    },
  });
}
