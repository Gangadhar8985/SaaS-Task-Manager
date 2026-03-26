import { Link, useRoute } from "wouter";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Bell, 
  Search, 
  Settings 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "All Tasks", icon: CheckSquare },
  { href: "/team", label: "Team", icon: Users },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  const [isActive] = useRoute(href === "/" ? "/" : `${href}/*`);
  
  return (
    <Link href={href} className={`
      flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
      ${isActive 
        ? "bg-primary/10 text-primary shadow-sm" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
    `}>
      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-400"}`} />
      {label}
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-10">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo.png`} 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              Proxima
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 glass flex-shrink-0 flex items-center justify-between px-8 z-10">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects, tasks, or team..." 
                className="w-full bg-slate-100/50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">JD</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-slate-700 leading-none">Jane Doe</p>
                <p className="text-slate-500 text-xs mt-1">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Area */}
        <main className="flex-1 overflow-y-auto p-8 hide-scrollbar relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
