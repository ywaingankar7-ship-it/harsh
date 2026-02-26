/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AIEyeTest from "./pages/AIEyeTest";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Prescriptions from "./pages/Prescriptions";
import Appointments from "./pages/Appointments";
import VirtualTryOn from "./pages/VirtualTryOn";
import GeminiChatbot from "./components/GeminiChatbot";
import { User } from "./types";
import { cn } from "./lib/utils";

// Placeholder components for missing pages
const Analytics = () => <div className="p-8 text-white">Analytics Page (Coming Soon)</div>;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("visionx_token");
    const savedUser = localStorage.getItem("visionx_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User, token: string) => {
    setUser(user);
    localStorage.setItem("visionx_token", token);
    localStorage.setItem("visionx_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("visionx_token");
    localStorage.removeItem("visionx_user");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex">
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
        
        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isCollapsed ? "ml-20" : "ml-64"
        )}>
          <Header user={user} />
          
          <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-test" element={<AIEyeTest />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/try-on" element={<VirtualTryOn />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <GeminiChatbot />
      </div>
    </Router>
  );
}

