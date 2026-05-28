"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Info,
  FolderPlus,
  Star,
  Library,
  Settings,
  HelpCircle,
  LayoutDashboard
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "About Visionary", href: "/about", icon: Info },
  ];

  const projectItems = [
    { name: "Create new project", href: "/new", icon: FolderPlus, isAction: true },
    { name: "Planner Inspector", href: "/planner", icon: LayoutDashboard },
    { name: "Favorites", href: "/graph", icon: Star },
    { name: "Library", href: "/metrics", icon: Library },
  ];

  const bottomItems = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help center", href: "/help", icon: HelpCircle },
  ];

  return (
    <aside
      className="flex flex-col shrink-0 relative z-20"
      style={{
        width: "25%",
        maxWidth: "300px",
        minWidth: "240px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid rgba(255,255,255,0.02)",
      }}
    >
      {/* ── Brand / Header ── */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <h1 className="text-[var(--fs-h1)] font-semibold text-[var(--text-primary)] tracking-tight">
          Visionary 2.0
        </h1>
        <button className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      </div>

      {/* ── Menu ── */}
      <div className="px-4 mt-2">
        <p className="section-label px-3">Menu</p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>
      </div>

      {/* ── Projects ── */}
      <div className="px-4 mt-8">
        <p className="section-label px-3">Projects</p>
        <nav className="space-y-1">
          {projectItems.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>
      </div>

      <div className="flex-1" />

      {/* ── Bottom Section ── */}
      <div className="px-4 mb-4">
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>
      </div>

      {/* ── User Profile ── */}
      <div className="px-4 pb-6">
        <div
          className="flex items-center gap-3 p-3 rounded-[var(--radius-component)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Darlene&backgroundColor=E17A47"
            alt="User"
            className="w-10 h-10 rounded-full bg-[var(--accent)]"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[var(--fs-nav)] font-medium text-[var(--text-primary)] truncate">
              Darlene Robertson
            </span>
            <span className="text-[var(--fs-sm)] text-[var(--text-muted)] truncate">
              darlny@gmail.com
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  isActive,
}: {
  item: { name: string; href: string; icon: any; isAction?: boolean };
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block group">
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-component)] transition-all duration-200 ${
          isActive
            ? "text-[var(--text-primary)] bg-[rgba(255,255,255,0.04)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.02)]"
        }`}
      >
        {item.isAction ? (
          <span className="w-5 h-5 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] text-lg leading-none transition-colors">
            +
          </span>
        ) : (
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"} transition-colors`} />
        )}
        <span className="text-[var(--fs-nav)] font-medium">{item.name}</span>
      </div>
    </Link>
  );
}
