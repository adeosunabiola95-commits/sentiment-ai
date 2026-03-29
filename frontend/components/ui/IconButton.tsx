import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/ds";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "header" | "avatar" | "errorDismiss";
  /** Visually hidden label for a11y (not required for `errorDismiss` when parent sets context) */
  label: string;
  children: ReactNode;
};

/**
 * Standard circular / square-ish icon-only control.
 */
export function IconButton({
  variant = "ghost",
  className,
  label,
  children,
  type = "button",
  ...rest
}: Props) {
  const variantClass =
    variant === "header"
      ? ds.button.headerIcon
      : variant === "avatar"
        ? ds.button.avatar
        : variant === "errorDismiss"
          ? cn("absolute right-2.5 top-2.5", ds.button.errorDismiss)
          : ds.button.ghostIcon;

  return (
    <button type={type} className={cn(variantClass, className)} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
