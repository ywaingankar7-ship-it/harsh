import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Appointment, Customer } from "../types";
import { cn } from "../lib/utils";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    customer_id: "",
    date: new Date().toISOString().split('T')[0],
    time: "10:00 AM",
    notes: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("visionx_token");
        const [apptRes, custRes] = await Promise.all([
          fetch("/api/appointments", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/customers", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAppointments(await apptRes.json());
        setCustomers(await custRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("visionx_token");
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("visionx_token");
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const apptRes = await fetch("/api/appointments", { headers: { Authorization: `Bearer ${token}` } });
        setAppointments(await apptRes.json());
        setIsAdding(false);
        setFormData({
          customer_id: "",
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM",
          notes: ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesFilter = filter === "all" || a.status === filter;
    const matchesSearch = a.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && !isAdding) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Appointment Manager</h1>
          <p className="text-slate-500">Schedule and track patient visits with ease.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="gradient-bg text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          {isAdding ? <CalendarDays className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? "View Calendar" : "Book Appointment"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 border-white/5 max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Select Patient</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none"
                >
                  <option value="">Choose a patient...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Notes</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  placeholder="Reason for visit..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-3 rounded-xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-bg text-white px-10 py-3 rounded-xl font-bold shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {["all", "pending", "approved", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      filter === s ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAppointments.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 border-white/5 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white truncate">{a.customer_name}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {a.time}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                      a.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      a.status === 'cancelled' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      a.status === 'approved' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {a.status}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2 italic">"{a.notes || "No notes provided."}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                      {a.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(a.id, 'approved')}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {a.status !== 'completed' && a.status !== 'cancelled' && (
                        <button 
                          onClick={() => updateStatus(a.id, 'cancelled')}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === 'approved' && (
                        <button 
                          onClick={() => updateStatus(a.id, 'completed')}
                          className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
