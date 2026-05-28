"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Home,
  Search,
  Info,
  FolderPlus,
  Star,
  Library,
  Settings,
  HelpCircle,
  Network,
  Activity,
  Fingerprint,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "About Rumik", path: "/about", icon: Info },
  ];

  const projectItems = [
    { name: "Create new project", path: "/new", icon: FolderPlus, isAction: true },
    { name: "Graph Explorer", path: "/graph", icon: Network },
    { name: "Metrics", path: "/metrics", icon: Activity },
    { name: "Identity", path: "/identity", icon: Fingerprint },
  ];

  const bottomItems = [
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Help center", path: "/help", icon: HelpCircle },
  ];

  const NavItem = ({ item, idx }: { item: typeof menuItems[0] & { isAction?: boolean }; idx: number }) => {
    const isActive = pathname === item.path;
    const Icon = item.icon;
    return (
      <Link href={item.path} className="block">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03, duration: 0.3 }}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] transition-all duration-200 relative group ${
            isActive
              ? "text-white font-medium bg-white/[0.07]"
              : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]"
          } ${item.isAction ? "text-[var(--text-primary)]" : ""}`}
        >
          {item.isAction ? (
            <span className="w-5 h-5 flex items-center justify-center text-[var(--text-secondary)]">+</span>
          ) : (
            <Icon className="w-[18px] h-[18px] shrink-0" />
          )}
          <span>{item.name}</span>
        </motion.div>
      </Link>
    );
  };

  return (
    <div
      className="w-[240px] shrink-0 flex flex-col border-r border-[var(--border-subtle)]"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4854a] to-[#b8622e] flex items-center justify-center shadow-[0_0_12px_rgba(210,130,70,0.3)]">
            <BrainCircuit className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">Rumik 2.0</span>
        </motion.div>
        <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/[0.06] transition-colors text-[var(--text-muted)]">
          <Library className="w-4 h-4" />
        </button>
      </div>

      {/* Menu Section */}
      <div className="px-4 mt-2">
        <div className="px-3 mb-2 section-label">Menu</div>
        <nav className="space-y-0.5">
          {menuItems.map((item, idx) => (
            <NavItem key={item.path} item={item} idx={idx} />
          ))}
        </nav>
      </div>

      {/* Projects Section */}
      <div className="px-4 mt-6">
        <div className="px-3 mb-2 section-label">Projects</div>
        <nav className="space-y-0.5">
          {projectItems.map((item, idx) => (
            <NavItem key={item.path} item={item} idx={idx + menuItems.length} />
          ))}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom items */}
      <div className="px-4 mb-2">
        <nav className="space-y-0.5">
          {bottomItems.map((item, idx) => (
            <NavItem key={item.path} item={item} idx={idx} />
          ))}
        </nav>
      </div>

      {/* User profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-5 py-4 border-t border-[var(--border-subtle)] flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4854a] to-[#925a2e] flex items-center justify-center text-white text-xs font-bold shadow-sm">
          U
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-medium text-white truncate">User</span>
          <span className="text-[11px] text-[var(--text-muted)] truncate">default session</span>
        </div>
      </motion.div>
    </div>
  );
}
