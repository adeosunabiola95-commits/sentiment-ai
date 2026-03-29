import type { ReactNode } from "react";
import { Input } from "@/components/ui/Input";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  autoComplete?: string;
};

/**
 * Modal-style search: optional leading icon + {@link Input} `search` variant.
 */
export function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  autoComplete = "off",
}: Props) {
  return (
    <label className="relative block" htmlFor={id}>
      <span className="sr-only">{label}</span>
      {icon != null ? (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <Input
        id={id}
        type="search"
        variant="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}
