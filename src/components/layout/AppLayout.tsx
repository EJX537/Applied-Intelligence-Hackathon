import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { usePwaMode } from "../../hooks/usePwaMode";
import { ModeBadge } from "../ModeBadge";
import { TabBar } from "./TabBar";

const pageTitles: Record<string, { icon: string; title: string }> = {
  "/user": { icon: "🏠", title: "Dashboard" },
  "/user/oral-health": { icon: "🦷", title: "Oral Health" },
  "/user/food-diet": { icon: "🥗", title: "Food & Diet" },
  "/user/food": { icon: "🍽", title: "Food Log" },
  "/user/steps": { icon: "👟", title: "Steps" },
  "/user/heart": { icon: "❤️", title: "Heart Rate" },
  "/user/activity": { icon: "🏃", title: "Activity" },
  "/user/ai": { icon: "🤖", title: "AI" },
  "/user/admin": { icon: "📊", title: "Admin Panel" },
  "/user/admin/ai": { icon: "🤖", title: "AI" },
  "/user/settings": { icon: "⚙️", title: "Settings" },
};

export function AppLayout() {
  const mode = usePwaMode();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll to top on route change
  useLayoutEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // Pick the title for the current route
  function matchPage(p: string) {
    return (
      pageTitles[p] ??
      (p.startsWith("/user/food") ? pageTitles["/user/food"] : undefined) ??
      pageTitles["/user"]
    );
  }
  const page = matchPage(pathname);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* ── Notch/island spacer ── */}
      <div className="shrink-0 h-[env(safe-area-inset-top,0px)]" />

      {/* ── Top bar ── */}
      <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">{page.icon}</span>
            <h1 className="text-base font-semibold text-[var(--color-text-h)] tracking-tight m-0">
              {page.title}
            </h1>
          </div>
          <ModeBadge mode={mode} />
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <main
        ref={mainRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth bg-[var(--color-bg)] px-4 pb-4"
      >
        <Outlet />
      </main>

      {/* ── Bottom nav ── */}
      <TabBar />
    </div>
  );
}
