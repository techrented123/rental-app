import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { clear as idbClear, get, set } from "idb-keyval";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Store a file in IndexedDB
 */
export async function storeFileInIndexedDB(
  file: File,
  key: string
): Promise<void> {
  try {
    await set(key, file);
  } catch (error) {
    console.error("Error storing file in IndexedDB:", error);
    throw error;
  }
}

/**
 * Get a file from IndexedDB by key
 */
export async function getFileFromIndexedDB(key: string): Promise<File | null> {
  try {
    const file = await get<File>(key);
    return file || null;
  } catch (error) {
    console.error("Error getting file from IndexedDB:", error);
    return null;
  }
}

/**
 * Clear all data from IndexedDB
 */
export async function clearIndexedDB(): Promise<void> {
  try {
    await idbClear();
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
    throw error;
  }
}
