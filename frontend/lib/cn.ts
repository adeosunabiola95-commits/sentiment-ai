/** Join Tailwind / conditional class strings without extra deps. */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
