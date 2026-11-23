import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names, resolving conflicts via tailwind-merge.
 * Accepts any value accepted by clsx (strings, arrays, objects, etc.).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
