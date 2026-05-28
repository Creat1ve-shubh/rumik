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
  Network,
  Activity,
  Fingerprint,
  Settings,
  HelpCircle,
  PanelLeftClose,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "About Rumik", href: "/about", icon: Info },
  ];

  const projectItems = [
    { name: "Create new project", href: "/new", icon: FolderPlus, isAction: true },
    { name: "Favorites", href: "/graph", icon: Star },
    { name: "Library", href: "/metrics", icon: Library },
  ];

  const bottomItems = [
    { name: "Settings", href: "/identity", icon: Settings },
    { name: "Help center", href: "/planner", icon: HelpCircle },
  ];

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 260,
        background: "var(--bg-sidebar)",
        borderRadius: "var(--radius-container) 0 0 var(--radius-container)",
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center justify-between px-6 pt-7 pb-5">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)", boxShadow: "0 0 14px rgba(225,122,71,0.35)" }}
          >
            <BrainCircuit className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-[1.25rem] font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
            Visionary 2.0
          </span>
        </motion.div>
        <button className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* ── Menu ── */}
      <div className="px-4 mt-1">
        <p className="section-label px-3 mb-2">Menu</p>
        <nav className="space-y-0.5">
          {menuItems.map((item, i) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} index={i} />
          ))}
        </nav>
      </div>

      {/* ── Projects ── */}
      <div className="px-4 mt-7">
        <p className="section-label px-3 mb-2">Projects</p>
        <nav className="space-y-0.5">
          {projectItems.map((item, i) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} index={i + 3} />
          ))}
        </nav>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom ── */}
      <div className="px-4 mb-3">
        <nav className="space-y-0.5">
          {bottomItems.map((item, i) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} index={i} />
          ))}
        </nav>
      </div>

      {/* ── User Profile ── */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E17A47] to-[#a85a30] flex items-center justify-center text-white text-sm font-semibold">
          D
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[0.875rem] font-medium text-[var(--text-primary)] truncate">Darlene Robertson</span>
          <span className="text-[0.75rem] text-[var(--text-muted)] truncate">darlny@gmail.com</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Reusable Nav Link ── */
function SidebarLink({
  item,
  isActive,
  index,
}: {
  item: { name: string; href: string; icon: any; isAction?: boolean };
  isActive: boolean;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block">
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.25 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] transition-all duration-200 ${
          isActive
            ? "text-[var(--text-primary)] font-medium"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        style={{ opacity: isActive ? 1 : 0.7 }}
      >
        {item.isAction ? (
          <span className="w-[18px] h-[18px] flex items-center justify-center text-[var(--text-secondary)] text-base leading-none">+</span>
        ) : (
          <Icon className="w-[18px] h-[18px] shrink-0" />
        )}
        <span>{item.name}</span>
      </motion.div>
    </Link>
  );
}
