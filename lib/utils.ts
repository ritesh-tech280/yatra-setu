import { inr } from "./calculations";
import type { Member, Payment, Yatra } from "@/types/yatra";

/**
 * Format date string into human friendly format e.g. "10 Aug 2026"
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = dateStr.includes("T") ? new Date(dateStr) : new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Format date string with time e.g. "10 Aug 2026, 04:30 PM"
 */
export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Generate a pre-filled WhatsApp share link for member receipt / dues reminder
 */
export function getWhatsAppReceiptUrl(
  member: Member,
  yatra: Yatra,
  paid: number,
  remaining: number,
  latestPayment?: Payment
): string {
  const cleanPhone = member.phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let message = `*${yatra.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Greetings ${member.name},\n\n`;
  message += `*Yatra Route:* ${yatra.startPlace} -> ${yatra.destination}\n`;
  message += `*Dates:* ${formatDate(yatra.startDate)} to ${formatDate(yatra.endDate)}\n`;
  message += `*Total Yatra Fare:* ${inr(yatra.fare)}\n`;
  message += `*Total Amount Paid:* ${inr(paid)}\n`;
  message += `*Remaining Due:* ${inr(remaining)}\n`;

  if (remaining === 0) {
    message += `*Status:* FULLY PAID\n`;
  } else {
    message += `*Status:* PAYMENT DUE\n`;
  }

  if (latestPayment) {
    message += `\n*Last Payment Received:*\n`;
    message += `- Amount: ${inr(latestPayment.amount)}\n`;
    message += `- Method: ${latestPayment.paymentMethod}\n`;
    message += `- Date: ${formatDate(latestPayment.paymentDate)}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Organizer:* ${yatra.organizerName}\n`;
  message += `Digitally managed via YatraSetu\n`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a pre-filled WhatsApp share link for an external contributor / donor receipt
 */
export function getWhatsAppContributionReceiptUrl(
  payment: Payment,
  yatra: Yatra
): string {
  const phone = payment.contributorPhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let message = `*${yatra.name} - Contribution / Donation Receipt (सहयोग रसीद)*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Respected *${payment.contributorName || "Donor"}*,\n\n`;
  message += `We gratefully acknowledge your financial contribution towards *${yatra.name}*!\n\n`;
  message += `*Contribution Details:*\n`;
  message += `- *Amount Received:* ${inr(payment.amount)}\n`;
  message += `- *Payment Mode:* ${payment.paymentMethod}\n`;
  message += `- *Date:* ${formatDate(payment.paymentDate)}\n`;
  if (payment.note) {
    message += `- *Purpose / Remark:* ${payment.note}\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Organizer:* ${yatra.organizerName}\n`;
  message += `Digitally acknowledged via YatraSetu\n`;

  if (!formattedPhone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Get initials from a person's name (e.g. "Ritesh Kumar" -> "RK")
 */
export function getInitials(name: string): string {
  if (!name) return "Y";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
