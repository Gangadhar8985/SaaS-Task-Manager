import { useState } from "react";
import { Link } from "wouter";
import { useListProjects, useCreateProject, useDeleteProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, Trash2, Edit2, Calendar, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export function Projects() {
  const { data: projects = [], isLoading } = useListProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const deleteProject = useDeleteProject();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate({ id });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Project</h1>
          <p className="text-slate-500 mt-2">Manage and track all your team's initiatives.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create New Project</DialogTitle>
            </DialogHeader>
            <CreateProjectForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Create your first project to start organizing tasks and collaborating with your team.</p>
          <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={() => handleDelete(project.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onDelete }: { project: any, onDelete: () => void }) {
  const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
  
  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    on_hold: "bg-amber-100 text-amber-700",
    archived: "bg-slate-100 text-slate-700"
  };

  return (
    <Card className="rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden group flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${statusColors[project.status]}`}>
            {project.status.replace('_', ' ')}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem className="cursor-pointer">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Link href={`/projects/${project.id}`} className="block group/link">
          <h3 className="text-xl font-display font-bold text-slate-900 group-hover/link:text-primary transition-colors line-clamp-1 mb-2">
            {project.name}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px]">
            {project.description || "No description provided."}
          </p>
        </Link>

        <div className="mt-6 pt-6 border-t border-slate-100 mt-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="font-bold text-slate-700">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {project.completedTasks}/{project.totalTasks} Tasks
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {format(new Date(project.updatedAt), 'MMM d')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CreateProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const createProject = useCreateProject();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ data: formData }, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-700">Project Name</Label>
        <Input 
          id="name" 
          value={formData.name}
          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          className="rounded-xl border-slate-200 focus-visible:ring-primary/20 h-11"
          placeholder="e.g. Q3 Marketing Campaign"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-700">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
          className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-colors resize-none"
          placeholder="What is this project about?"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700">Status</Label>
        <Select value={formData.status} onValueChange={(val: any) => setFormData(p => ({ ...p, status: val }))}>
          <SelectTrigger className="rounded-xl h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={createProject.isPending} 
          className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
        >
          {createProject.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
