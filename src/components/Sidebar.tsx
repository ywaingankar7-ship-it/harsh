import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  Eye, 
  BarChart3, 
  UserCircle, 
  LogOut,
  ShieldCheck,
  FileText,
  Scan,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";

interface SidebarProps {
  user: User;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ user, onLogout, isCollapsed, onToggle }: SidebarProps) {
  const adminLinks = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/customers", icon: Users, label: "Patients" },
    { to: "/inventory", icon: Package, label: "Inventory" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/prescriptions", icon: FileText, label: "Prescriptions" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  const patientLinks = [
    { to: "/", icon: UserCircle, label: "Patient Portal" },
    { to: "/inventory", icon: Package, label: "Shop" },
    { to: "/appointments", icon: Calendar, label: "My Appointments" },
    { to: "/prescriptions", icon: FileText, label: "My Prescriptions" },
    { to: "/ai-test", icon: Eye, label: "AI Eye Test" },
    { to: "/try-on", icon: Scan, label: "Virtual Try-On" },
  ];

  const links = user.role === 'admin' ? adminLinks : patientLinks;

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-slate-900 border-r border-white/10 flex flex-col z-50 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div className="whitespace-nowrap">
            <h1 className="text-xl font-bold text-white tracking-tight">VisionX</h1>
            <p className="text-[10px] font-medium text-cyan-400 uppercase tracking-widest">AI Optical ERP</p>
          </div>
        </div>
        
        <button 
          onClick={onToggle}
          className={cn(
            "p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              title={isCollapsed ? link.label : ""}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center px-0"
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className={cn("flex items-center gap-3 mb-6 px-2 transition-all duration-300", isCollapsed && "justify-center px-0")}>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-6 h-6 text-slate-400" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          title={isCollapsed ? "Logout" : ""}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
