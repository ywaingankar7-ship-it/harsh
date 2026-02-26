import React, { useState } from "react";
import { Eye, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl shadow-cyan-500/20">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">VisionX AI</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Precision Vision <br />
            <span className="text-transparent bg-clip-text gradient-bg">Powered by AI</span>
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            The next generation of optical ERP and automated eye diagnosis systems. Streamline your practice with intelligence.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Secure Data</h3>
              <p className="text-slate-500 text-sm">Clinical-grade encryption for patient privacy.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Eye className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">AI Diagnosis</h3>
              <p className="text-slate-500 text-sm">Automated retinal analysis with 99% accuracy.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass-card p-10 shadow-2xl border-white/10">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
              <p className="text-slate-500">Enter your credentials to access VisionX</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    placeholder="admin@visionx.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-slate-400">Password</label>
                  <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-bg text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500 text-sm">
                Need help? <a href="#" className="text-cyan-400 hover:underline">Contact Admin</a>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-white font-bold text-xl">10k+</p>
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">Patients</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">99.9%</p>
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">24/7</p>
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">AI Support</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
