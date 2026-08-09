import type { YatraRole } from "@/types/yatra";

/**
 * Centralized Role-Based Access Control (RBAC) Permission Helpers
 * 
 * Rules:
 * - Organizer: Full management access
 * - Sahayak: Operational access (cannot delete records, edit payments, alter Yatra settings, or manage staff)
 * - No Access: Blocked from all Yatra actions
 */

export function canViewYatra(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canEditYatra(role: YatraRole): boolean {
  return role === "organizer";
}

export function canDeleteYatra(role: YatraRole): boolean {
  return role === "organizer";
}

export function canAddMember(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canEditMember(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canDeleteMember(role: YatraRole): boolean {
  return role === "organizer";
}

export function canAddPayment(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canViewPayment(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canEditPayment(role: YatraRole): boolean {
  return role === "organizer";
}

export function canDeletePayment(role: YatraRole): boolean {
  return role === "organizer";
}

export function canAddExpense(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canViewExpense(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canEditExpense(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}

export function canDeleteExpense(role: YatraRole): boolean {
  return role === "organizer";
}

export function canManageSahayaks(role: YatraRole): boolean {
  return role === "organizer";
}

export function canAddSahayak(role: YatraRole): boolean {
  return role === "organizer";
}

export function canRemoveSahayak(role: YatraRole): boolean {
  return role === "organizer";
}

export function canViewReports(role: YatraRole): boolean {
  return role === "organizer" || role === "sahayak";
}
