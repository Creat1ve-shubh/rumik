"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Activity, Network, LayoutDashboard, Fingerprint } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Chat", path: "/", icon: BrainCircuit },
    { name: "Graph", path: "/graph", icon: Network },
    { name: "Planner", path: "/planner", icon: LayoutDashboard },
    { name: "Metrics", path: "/metrics", icon: Activity },
    { name: "Identity", path: "/identity", icon: Fingerprint },
  ];

  return (
    <div className="w-64 bg-[#0a0a0f] border-r border-white/10 flex flex-col relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#7c5cfc]/10 to-transparent pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#4f46e5] flex items-center justify-center shadow-[0_0_15px_rgba(124,92,252,0.4)]">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CMP Hub
          </h1>
        </motion.div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 relative z-10">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative block"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? "text-white font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 transition-colors duration-300 ${isActive ? "text-[#7c5cfc]" : "group-hover:text-gray-300"}`} />
                <span className="relative z-10">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 m-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md relative z-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">System Status</span>
        </div>
        <div className="text-[10px] text-gray-500 flex justify-between">
          <span>Latency Budget</span>
          <span className="text-white">2000ms</span>
        </div>
        <div className="text-[10px] text-gray-500 flex justify-between mt-1">
          <span>Mode</span>
          <span className="text-[#7c5cfc]">Degraded / Local</span>
        </div>
      </motion.div>
    </div>
  );
}
