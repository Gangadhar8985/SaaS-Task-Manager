import { useState } from "react";
import { useRoute } from "wouter";
import { useGetProject } from "@/hooks/use-projects";
import { useListProjectTasks, useUpdateTask, useCreateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useListMembers } from "@/hooks/use-members";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, MoreHorizontal, Calendar, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { format } from "date-fns";

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-200', dot: 'bg-slate-400' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-100', dot: 'bg-indigo-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-100', dot: 'bg-emerald-500' }
] as const;

export function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  
  const { data: project, isLoading: loadingProject } = useGetProject(projectId);
  const { data: tasks = [], isLoading: loadingTasks } = useListProjectTasks(projectId);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (loadingProject || loadingTasks) return <div className="p-8 animate-pulse"><div className="h-10 w-1/3 bg-slate-200 rounded-lg mb-8" /></div>;
  if (!project) return <div className="p-8 text-center text-slate-500">Project not found</div>;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{project.name}</h1>
            {project.description && <p className="text-slate-500 mt-2 max-w-2xl">{project.description}</p>}
          </div>
          <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Create New Task</DialogTitle>
              </DialogHeader>
              <CreateTaskForm projectId={projectId} onSuccess={() => setIsTaskModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-8">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="font-display font-semibold text-slate-700">{col.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 px-1 pb-2">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <KanbanTaskCard key={task.id} task={task} />
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanTaskCard({ task }: { task: any }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const priorityColors: Record<string, string> = {
    high: "bg-rose-100 text-rose-700 border-rose-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <Card className="p-4 rounded-xl shadow-sm hover:shadow-md border border-slate-200/80 bg-white transition-all duration-200 cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority]}`}>
          {task.priority}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Move to</div>
            {COLUMNS.map(col => (
              <DropdownMenuItem 
                key={col.id} 
                disabled={task.status === col.id}
                onClick={() => updateTask.mutate({ id: task.id, data: { status: col.id } })}
                className="cursor-pointer font-medium"
              >
                {col.title}
              </DropdownMenuItem>
            ))}
            <div className="h-px bg-slate-100 my-1"></div>
            <DropdownMenuItem 
              onClick={() => deleteTask.mutate({ id: task.id })}
              className="cursor-pointer text-destructive focus:bg-destructive/10 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <h4 className="font-semibold text-slate-900 leading-tight mb-2">{task.title}</h4>
      {task.description && <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          {task.dueDate ? (
            <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-rose-500' : ''}`}>
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          ) : (
             <span className="text-slate-400">No date</span>
          )}
        </div>
        {task.assigneeInitials ? (
          <Avatar className="h-6 w-6 border border-slate-200 shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {task.assigneeInitials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
            <span className="text-[10px] text-slate-400">?</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function CreateTaskForm({ projectId, onSuccess }: { projectId: number, onSuccess: () => void }) {
  const createTask = useCreateTask();
  const { data: members = [] } = useListMembers();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as const,
    priority: "medium" as const,
    assigneeId: "none",
    dueDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate({ 
      data: {
        ...formData,
        projectId,
        assigneeId: formData.assigneeId === "none" ? undefined : parseInt(formData.assigneeId),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      }
    }, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label>Task Title</Label>
        <Input 
          value={formData.title}
          onChange={e => setFormData(p => ({...p, title: e.target.value}))}
          placeholder="What needs to be done?"
          className="rounded-xl h-11"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(p => ({...p, description: e.target.value}))}
          className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(val: any) => setFormData(p => ({ ...p, priority: val }))}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input 
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData(p => ({...p, dueDate: e.target.value}))}
            className="rounded-xl h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select value={formData.assigneeId} onValueChange={(val) => setFormData(p => ({ ...p, assigneeId: val }))}>
          <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Unassigned" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="none">Unassigned</SelectItem>
            {members.map(m => (
              <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={createTask.isPending} className="w-full rounded-xl h-11 font-semibold">
          {createTask.isPending ? "Saving..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
