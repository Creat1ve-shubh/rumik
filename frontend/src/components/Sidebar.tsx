"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/",         label: "Chat",      icon: "💬" },
  { href: "/graph",    label: "Graph",     icon: "🔗" },
  { href: "/planner",  label: "Planner",   icon: "🧠" },
  { href: "/metrics",  label: "Metrics",   icon: "📊" },
  { href: "/identity", label: "Identity",  icon: "🪞" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen flex flex-col glass z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[var(--cmp-border)]">
        <h1 className="text-xl font-bold gradient-text tracking-tight">CMP</h1>
        <p className="text-xs text-[var(--cmp-text-muted)] mt-1">
          Cognitive Memory Protocol
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? "bg-[var(--cmp-accent)]/15 text-[var(--cmp-accent)] glow-ring"
                    : "text-[var(--cmp-text-muted)] hover:text-[var(--cmp-text)] hover:bg-[var(--cmp-surface-2)]"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-6 py-4 border-t border-[var(--cmp-border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--cmp-text-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--cmp-success)] pulse-glow" />
          System Online
        </div>
        <p className="text-[10px] text-[var(--cmp-text-muted)] mt-1 opacity-60">
          v0.1.0 · Phase 1
        </p>
      </div>
    </aside>
  );
}
