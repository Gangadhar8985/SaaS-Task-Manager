import { useListTasks, useDeleteTask } from "@/hooks/use-tasks";
import { useListProjects } from "@/hooks/use-projects";
import { format } from "date-fns";
import { CheckSquare, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Tasks() {
  const { data: tasks = [], isLoading } = useListTasks();
  const { data: projects = [] } = useListProjects();
  const deleteTask = useDeleteTask();

  const getProjectName = (id: number | null | undefined) => {
    if (!id) return "No Project";
    return projects.find(p => p.id === id)?.name || "Unknown Project";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">All Tasks</h1>
        <p className="text-slate-500 mt-2">A global view of everything happening across your workspace.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Task Title</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                    <td className="px-6 py-4 text-slate-500">{getProjectName(task.projectId)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                        task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                        task.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if (confirm("Delete this task?")) deleteTask.mutate({ id: task.id });
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
