import React, { useState, useEffect } from "react";
import { 
  Users, 
  Package, 
  Calendar, 
  Eye, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { User } from "../types";

interface DashboardProps {}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("visionx_token");
        const [statsRes, logsRes] = await Promise.all([
          fetch("/api/analytics", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/activity-logs", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const stats = await statsRes.json();
        const logs = await logsRes.json();
        
        setData(stats);
        setActivities(logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Patients", value: data.stats.totalCustomers, icon: Users, color: "cyan", trend: "+12%", up: true },
    { label: "AI Eye Tests", value: data.stats.aiTests, icon: Eye, color: "indigo", trend: "+24%", up: true },
    { label: "Appointments", value: data.stats.appointmentsToday, icon: Calendar, color: "emerald", trend: "Today", up: true },
    { label: "Low Stock", value: data.stats.lowStock, icon: AlertCircle, color: "rose", trend: "-2", up: false },
  ];

  const chartData = [
    { name: "Mon", tests: 12, sales: 4000 },
    { name: "Tue", tests: 18, sales: 3000 },
    { name: "Wed", tests: 15, sales: 5000 },
    { name: "Thu", tests: 22, sales: 2780 },
    { name: "Fri", tests: 30, sales: 1890 },
    { name: "Sat", tests: 25, sales: 2390 },
    { name: "Sun", tests: 10, sales: 3490 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button className="gradient-bg text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            Generate Report
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">VisionX Intelligence Hub</h3>
              <p className="text-slate-500 text-sm">Diagnosis & Appointment Trends</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400 outline-none focus:ring-1 focus:ring-cyan-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tests" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTests)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-cyan-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white">System Alerts</h3>
            </div>
            <div className="space-y-4">
              {data.stats.lowStock > 0 && (
                <div className="flex gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">Low Stock Alert</p>
                    <p className="text-xs text-slate-500">{data.stats.lowStock} items are running low. Please restock soon.</p>
                  </div>
                </div>
              )}
              {data.stats.appointmentsToday > 0 && (
                <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <Calendar className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">New Appointment</p>
                    <p className="text-xs text-slate-500">You have {data.stats.appointmentsToday} appointments today.</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">AI System Ready</p>
                  <p className="text-xs text-slate-500">Gemini-3.1-Pro is online and ready for eye diagnosis.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 flex-1">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Recent Activity
            </h3>
            <div className="space-y-6">
              {activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 4 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-white/5"></div>}
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-bold text-white">{activity.user_name}</span> {activity.action}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
