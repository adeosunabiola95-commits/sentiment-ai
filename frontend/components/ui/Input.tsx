import { cn } from "@/lib/cn";
import { ds } from "@/lib/ds";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** `pill` = floating bar; `search` = modal search field */
  variant?: "pill" | "search";
  invalid?: boolean;
};

export function Input({ className, variant = "pill", invalid, ...rest }: Props) {
  const base = variant === "search" ? ds.input.search : ds.input.pill;
  return (
    <input
      className={cn(base, invalid && ds.input.invalid, className)}
      {...rest}
    />
  );
}
