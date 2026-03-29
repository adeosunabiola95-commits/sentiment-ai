"use client";

import { HapticsProvider } from "@/components/HapticsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <HapticsProvider>{children}</HapticsProvider>;
}
