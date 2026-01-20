import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Segédfüggvény a Tailwind CSS osztályok intelligens összefűzéséhez és ütközésfeloldásához.
 * Kombinálja a 'clsx' feltételes logikáját a 'tailwind-merge' optimalizációjával.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}