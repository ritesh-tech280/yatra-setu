import { createHash, randomBytes } from "crypto";
import type { YatraInvitation } from "@/types/yatra";

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type { YatraInvitation };

export function newInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function invitationTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getAppUrl(request?: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {}
  }
  return "http://localhost:3000";
}
