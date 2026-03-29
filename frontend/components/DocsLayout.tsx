"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";

const LINKS = [
  { id: "getting-started", label: "Getting started" },
  { id: "sentiment-chart", label: "Sentiment chart" },
  { id: "insights", label: "Analysis" },
  { id: "recent-analyses", label: "Recent analyses" },
  { id: "analyze", label: "Analyze" },
] as const;

const SECTION_IDS = LINKS.map((l) => l.id);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function computeActiveSectionId(): string {
  if (typeof window === "undefined") return SECTION_IDS[0];

  const scrollY = window.scrollY;
  const viewH = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (scrollY + viewH >= docHeight - 4) {
    return SECTION_IDS[SECTION_IDS.length - 1];
  }

  const offset = Math.min(160, viewH * 0.18);
  let active = SECTION_IDS[0];

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + scrollY;
    if (top <= scrollY + offset) active = id;
  }

  return active;
}

function SectionNavLink({
  id,
  label,
  active,
  compact,
}: {
  id: string;
  label: string;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <a
      href={`#${id}`}
      aria-current={active ? "location" : undefined}
      className={`motion-nav-item inline-flex items-center gap-2 py-1.5 ${
        compact ? "shrink-0 whitespace-nowrap rounded-full px-2 text-xs" : "rounded-lg px-2 text-sm"
      } ${
        active
          ? "text-black"
          : "text-text-tertiary hover:bg-neutral-100 hover:text-text-primary"
      }`}
    >
      <span
        className={`inline-flex w-4 shrink-0 justify-end font-normal leading-none tabular-nums ${
          active
            ? "text-sm text-black"
            : compact
              ? ""
              : "text-[10px] text-text-tertiary"
        }`}
        aria-hidden
      >
        {active ? "−" : compact ? "" : "-"}
      </span>
      <span>{label}</span>
    </a>
  );
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string>(SECTION_IDS[0]);

  const syncActive = useCallback(() => {
    setActiveId(computeActiveSectionId());
  }, []);

  useEffect(() => {
    syncActive();
    const t = window.setTimeout(syncActive, 50);
    const t2 = window.setTimeout(syncActive, 300);

    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
    window.addEventListener("hashchange", syncActive);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
      window.removeEventListener("hashchange", syncActive);
    };
  }, [syncActive]);

  return (
    <div className="relative min-h-screen w-full">
      <AppHeader onLogoClick={scrollToTop} />

      {/* Floats on the side; starts below the app header */}
      <aside
        className="fixed top-14 z-20 hidden h-[calc(100vh-3.5rem)] w-[13.5rem] flex-col overflow-y-auto py-6 pl-4 pr-3 lg:flex left-[max(1rem,calc((100vw-42rem)/2-13.5rem-1rem))]"
        aria-label="Section index"
      >
        <nav
          className="mt-[20vh] flex flex-col gap-0.5"
          aria-label="Page sections"
        >
          {LINKS.map(({ id, label }) => (
            <SectionNavLink
              key={id}
              id={id}
              label={label}
              active={activeId === id}
            />
          ))}
        </nav>
      </aside>

      {/* Full-width shell so children with mx-auto center to the viewport */}
      <div className="relative z-10 w-full min-w-0">
        <div className="sticky top-14 z-30 border-b border-neutral-100 bg-white lg:hidden">
          <div className="flex items-center gap-1 overflow-x-auto px-3 py-2.5">
            {LINKS.map(({ id, label }) => (
              <SectionNavLink
                key={id}
                id={id}
                label={label}
                active={activeId === id}
                compact
              />
            ))}
          </div>
        </div>

        {/* ~20px extra inset from the fixed aside so the Liveline chart clears the index rail */}
        <div className="lg:pl-5">{children}</div>
      </div>
    </div>
  );
}
