import { cn } from "@/lib/cn";
import { ds } from "@/lib/ds";

export function SectionCard({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="w-full scroll-mt-28 rounded-2xl bg-surface px-0 py-4 sm:py-5 lg:scroll-mt-10"
    >
      <h2 className={ds.typography.cardSectionTitle}>{title}</h2>
      <div className={cn("mt-3", ds.typography.body)}>{children}</div>
    </section>
  );
}
