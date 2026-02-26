import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit, 
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Customer } from "../types";
import { cn } from "../lib/utils";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("visionx_token");
        const res = await fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Patient Directory</h1>
          <p className="text-slate-500">Manage patient records and diagnostic history.</p>
        </div>
        <button className="gradient-bg text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New Patient
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <div className="h-8 w-px bg-white/10"></div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Total: {filteredCustomers.length} Patients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCustomers.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 border-white/5 hover:border-white/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors"></div>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <UserCircle className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{customer.name}</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Patient ID: #{customer.id.toString().padStart(4, '0')}</p>
                </div>
                <button className="ml-auto p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Mail className="w-4 h-4 text-cyan-500/50" />
                  <span className="text-sm truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-500/50" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                  <MapPin className="w-4 h-4 text-rose-500/50" />
                  <span className="text-sm truncate">{customer.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(customer.created_at).toLocaleDateString()}
                </div>
                <button className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:gap-2.5 transition-all">
                  View Profile
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
