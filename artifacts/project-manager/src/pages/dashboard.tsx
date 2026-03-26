import { useListProjects } from "@/hooks/use-projects";
import { useListTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { CheckSquare, Clock, FolderKanban, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export function Dashboard() {
  const { data: projects = [], isLoading: loadingProjects } = useListProjects();
  const { data: tasks = [], isLoading: loadingTasks } = useListTasks();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  const taskStatsData = [
    { name: 'To Do', value: todoTasks, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressTasks, color: '#6366f1' },
    { name: 'Done', value: doneTasks, color: '#10b981' },
  ];

  // Project task counts for bar chart
  const projectChartData = projects.slice(0, 5).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    total: p.totalTasks,
    completed: p.completedTasks
  }));

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loadingProjects || loadingTasks) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Good morning, Jane</h1>
        <p className="text-slate-500 mt-2">Here's what's happening across your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={projects.length} 
          icon={FolderKanban} 
          trend="+2 this week" 
          trendUp 
        />
        <StatCard 
          title="Active Projects" 
          value={activeProjects} 
          icon={TrendingUp} 
          color="text-primary" 
          bg="bg-primary/10" 
        />
        <StatCard 
          title="Tasks Pending" 
          value={todoTasks + inProgressTasks} 
          icon={Clock} 
          color="text-amber-500" 
          bg="bg-amber-50" 
        />
        <StatCard 
          title="Tasks Completed" 
          value={doneTasks} 
          icon={CheckSquare} 
          color="text-emerald-500" 
          bg="bg-emerald-50" 
          trend="+12% vs last week" 
          trendUp 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 glass-card border-none rounded-2xl">
            <h2 className="font-display font-semibold text-lg mb-6">Project Progress Overview</h2>
            <div className="h-[300px]">
              {projects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="total" name="Total Tasks" fill="#e2e8f0" radius={[4, 4, 4, 4]} barSize={24} />
                    <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No project data available" />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-8">
          <Card className="p-6 glass-card border-none rounded-2xl flex flex-col">
            <h2 className="font-display font-semibold text-lg mb-2">Task Distribution</h2>
            <div className="h-[200px] flex-1">
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatsData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No tasks yet" />
              )}
            </div>
            {tasks.length > 0 && (
              <div className="flex justify-center gap-4 mt-4">
                {taskStatsData.map(stat => (
                  <div key={stat.name} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                    {stat.name}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 glass-card border-none rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg">Recent Tasks</h2>
              <Link href="/tasks" className="text-sm font-medium text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {recentTasks.length > 0 ? recentTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'done' ? 'bg-emerald-500' : 
                    task.status === 'in_progress' ? 'bg-primary' : 'bg-slate-300'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{format(new Date(task.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              )) : (
                <EmptyState message="No recent tasks" />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color = "text-slate-600", bg = "bg-slate-100" }: any) {
  return (
    <Card className="p-6 rounded-2xl glass-card border-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-display font-bold text-slate-900 mt-2">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend}
          </span>
        </div>
      )}
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <FolderKanban className="w-6 h-6 opacity-50" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
