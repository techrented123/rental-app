"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Stepper, Button } from "@material-tailwind/react";

export { Stepper, Button };

/**
 * Read a File/Blob as Base64 (no “data:…” prefix) so you can
 * store it as a string in localStorage.
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is like "data:<mime>;base64,XXXXX"
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1]; // drop the prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a Base64 string (no prefix) back into a File.
 * @param base64 – the Base64 data
 * @param fileName – whatever name you want the File to have
 * @param mimeType – e.g. "application/pdf" or "image/jpeg"
 */
export function base64ToFile(
  base64: string,
  fileName: string,
  mimeType: string
): File {
  // Decode base64 to raw binary
  const binary = atob(base64);
  // Create an ArrayBuffer and a view to fill it
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  // Build a File
  return new File([buffer], fileName, { type: mimeType });
}

export const storeFileInIndexedDB = async (file: File, key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("RentalAppFiles", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");
      store.put(file, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("files");
    };
  });
};

export const getFileFromIndexedDB = async (key: string): Promise<File | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("RentalAppFiles", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");
      const getRequest = store.get(key);

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
};
