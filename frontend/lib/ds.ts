/**
 * Design-system class tokens — single source for reusable UI strings.
 * Align with `app/globals.css` @theme and `designsystem_baseline.md`.
 */

export const ds = {
  typography: {
    /** Modal / card titles (baseline h2) */
    title: "text-base font-medium tracking-tight text-text-primary",
    /** Page section titles */
    sectionTitle: "text-lg font-medium tracking-tight text-text-primary",
    /** Compact section heading inside cards */
    cardSectionTitle: "text-sm font-medium tracking-tight text-text-primary",
    body: "text-sm text-text-secondary",
    bodyPrimary: "text-sm text-text-primary",
    caption: "text-xs text-text-tertiary",
    overline: "text-xs font-semibold uppercase tracking-wide text-text-tertiary",
    emptyState: "text-center text-sm text-text-secondary",
  },

  input: {
    /** Full pill (floating bar) */
    pill: "motion-focus-ring w-full rounded-full border bg-elevated px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none border-border focus:border-primary focus:ring-2 focus:ring-primary/12",
    /** Applied on top of pill or search when `invalid` */
    invalid:
      "border-red-500 ring-2 ring-red-500/25 focus:border-red-500 focus:ring-2 focus:ring-red-500/30",
    /** Modal search (rounded-xl, room for leading icon) */
    search:
      "motion-focus-ring w-full rounded-xl border border-border bg-elevated py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-2 focus:ring-primary/12",
  },

  button: {
    /** Primary CTA — icon or text in a circle */
    primaryRound:
      "motion-press-primary inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60",
    /** Secondary outline (pair picker trigger) */
    secondaryPill:
      "motion-focus-ring motion-press-tint w-full shrink-0 rounded-full border border-border bg-surface-subtle px-3 py-2.5 text-left text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/12 sm:w-[calc(11rem*0.7*0.9)]",
    /** Ghost icon (modal close, row actions) */
    ghostIcon:
      "motion-press rounded-lg p-2 text-text-tertiary transition-colors hover:bg-elevated hover:text-text-primary",
    /** Category tab — inactive */
    tabInactive:
      "rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-elevated/70 hover:text-text-primary motion-reduce:transition-none",
    /** Category tab — active */
    tabActive:
      "rounded-lg px-3 py-2 text-left text-sm font-medium text-text-primary bg-elevated motion-reduce:transition-none",
    /** Header circular controls (logo) */
    headerIcon:
      "motion-press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0f172a] outline-none focus:outline-none focus-visible:outline-none",
    /** Header account chip */
    avatar:
      "motion-press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200/90 text-[13px] font-semibold text-neutral-600 outline-none hover:bg-neutral-300/90 focus:outline-none focus-visible:outline-none",
    /** Error toast dismiss */
    errorDismiss:
      "rounded-md p-1 text-[#822727]/50 transition-colors hover:bg-red-100/80 hover:text-[#822727]",
  },

  surface: {
    /** Default elevated card */
    card: "motion-surface rounded-xl border border-border bg-surface",
    /** Modal shell (pair picker) */
    modalPanel:
      "relative flex max-h-[min(88vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] border border-border bg-surface shadow-[0_-12px_48px_rgba(15,23,42,0.12)] sm:max-h-[min(85vh,620px)] sm:rounded-[32px] sm:shadow-[0_20px_60px_rgba(15,23,42,0.12)]",
    /** Floating analyze bar container */
    floatBar:
      "motion-float-bar motion-surface pointer-events-auto flex w-full max-w-[calc(42rem*0.7*0.9)] flex-col gap-2.5 rounded-full border border-border bg-surface/95 px-3 py-2.5 shadow-[0px_8px_32px_rgba(15,23,42,0.072)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-2.5 sm:py-2 sm:pl-3 sm:pr-2",
  },

  toast: {
    error:
      "pointer-events-auto relative rounded-xl border border-red-200/90 bg-[#FFF5F5] px-4 py-3 pr-11 text-sm leading-snug text-[#822727] shadow-[0_8px_24px_rgba(130,39,39,0.08)]",
  },

  layout: {
    modalHeaderRow: "flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5",
    modalNav: "flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-40 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:px-2 sm:py-3 [&::-webkit-scrollbar]:hidden",
    searchRow: "shrink-0 border-b border-border-hairline px-3 py-2.5 sm:px-4",
  },
} as const;
