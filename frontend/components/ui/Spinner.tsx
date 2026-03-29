import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** Pixel size of the spinner box (default 32) */
  size?: number;
  /** White ring for use on primary-filled buttons */
  variant?: "default" | "onPrimary";
};

export function Spinner({ className, size = 32, variant = "default" }: Props) {
  const s = `${size}px`;
  const ring =
    variant === "onPrimary"
      ? "border-2 border-white/30 border-t-white"
      : "border-2 border-elevated border-t-primary";
  return (
    <div
      className={cn(
        "animate-spin rounded-full motion-reduce:animate-none",
        ring,
        className
      )}
      style={{ width: s, height: s }}
      aria-hidden
    />
  );
}
