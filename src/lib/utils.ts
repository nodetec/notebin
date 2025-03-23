import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getExtension(filename: string) {
  // Find the position of the first dot
  const firstDotPos = filename.indexOf(".");

  // No extension
  if (firstDotPos === -1) {
    return undefined;
  }

  // Return everything after the first dot
  return filename.substring(firstDotPos + 1);
}
