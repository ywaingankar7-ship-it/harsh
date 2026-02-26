import React, { useState, useEffect } from "react";
import { Bell, Search, Settings, User } from "lucide-react";
import { User as UserType } from "../types";

interface HeaderProps {
  user: UserType;
}

export default function Header({ user }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("visionx_token");
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="relative w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search patients, inventory, or reports..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 transition-all relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
            )}
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
