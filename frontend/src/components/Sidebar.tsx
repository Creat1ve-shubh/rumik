"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Activity, Network, LayoutDashboard, Fingerprint, Zap } from "lucide-react";

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
    <div className="w-[260px] bg-white/40 flex flex-col relative overflow-hidden">
      
      <div className="p-6 relative z-10 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#f8e534] flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-6 h-6 text-black" />
          </div>
        </motion.div>
        <div className="w-8 h-8 rounded-lg bg-white/50 border border-gray-200 flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      <div className="px-6 py-2">
        <h3 className="text-[11px] font-bold text-gray-400 mb-3 tracking-wider">MAIN MENU</h3>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 relative z-10">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? "text-black font-semibold" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-black/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-gray-100/80 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-[18px] h-[18px] relative z-10 transition-colors duration-300 ${isActive ? "text-black" : "group-hover:text-gray-600"}`} />
                <span className="relative z-10 text-[13px]">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 mx-4 mb-6 rounded-[20px] bg-gradient-to-r from-[#98f5e1] to-[#e3f282] shadow-[0_10px_20px_rgba(152,245,225,0.3)] relative z-10 flex items-center gap-3 cursor-pointer hover:brightness-105 transition-all"
      >
        <Zap className="w-6 h-6 text-black shrink-0" />
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-black">Get the extension</span>
          <span className="text-[11px] font-semibold text-black/60 underline decoration-black/30 underline-offset-2">Install Now</span>
        </div>
      </motion.div>
    </div>
  );
}
