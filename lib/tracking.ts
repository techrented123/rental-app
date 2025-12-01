import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

export interface TrackingData {
  sessionId: string;
  step: number;
  lastActivity: string;
  email?: string;
  source: string;
  property: string;
  name?: string;
  address?:
    | string
    | {
        Address?: string;
        City?: string;
        State?: string;
        PostalCode?: string;
      };
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  ip?: string;
  createdAt: number;
  userReminderSent?: boolean;
  salesAlertSent?: boolean;
}

const COOKIE_NAME = "application_session_id";
const TRACKING_COOKIE_NAME = "application_tracking_data";

/**
 * Generate or retrieve session ID from cookie
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    // Server-side: generate new ID (will be set by API)
    return uuidv4();
  }

  let sessionId = Cookies.get(COOKIE_NAME);

  if (!sessionId) {
    sessionId = uuidv4();
    // Set cookie with 30 day expiration
    Cookies.set(COOKIE_NAME, sessionId, { expires: 30 });
  }

  return sessionId;
}

/**
 * Get tracking data from cookie (client-side only)
 */
export function getTrackingDataFromCookie(): Partial<TrackingData> | null {
  if (typeof window === "undefined") return null;

  const data = Cookies.get(TRACKING_COOKIE_NAME);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Update tracking data in cookie (client-side only)
 */
export function updateTrackingCookie(data: Partial<TrackingData>): void {
  if (typeof window === "undefined") return;

  const existing = getTrackingDataFromCookie() || {};
  const updated = { ...existing, ...data };

  Cookies.set(TRACKING_COOKIE_NAME, JSON.stringify(updated), { expires: 30 });
}

/**
 * Clear tracking cookies
 */
export function clearTrackingCookies(): void {
  if (typeof window === "undefined") return;

  Cookies.remove(COOKIE_NAME);
  Cookies.remove(TRACKING_COOKIE_NAME);
}
