/** tiny classnames joiner to avoid clsx dep */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
