import { Spinner } from "@/components/ui";
import { ds } from "@/lib/ds";

export function LoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2.5 py-4"
      role="status"
      aria-live="polite"
    >
      <Spinner size={32} />
      <p className={ds.typography.body}>Analyzing sentiment…</p>
    </div>
  );
}
