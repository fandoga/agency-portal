import { Role, Status } from "@/src/entities/members/lib/types";

// Utility functions for sent-invites-modal feature

/**
 * Format ISO date string to DD.MM.YYYY format
 * @param isoDate - ISO date string
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return "";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}

/**
 * Copy text to clipboard using Clipboard API
 * @param text - Text to copy
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Role labels mapping (Russian)
 */
export const roleLabels: Record<Role, string> = {
  owner: "Администратор",
  admin: "Менеджер",
  member: "Участник",
};

/**
 * Status configuration with labels and styling
 */
export const statusConfig: Record<
  Status,
  { label: string; variant: string; color: string }
> = {
  pending: {
    label: "Ожидает",
    variant: "outline",
    color: "text-yellow-600 border-yellow-600",
  },
  accepted: {
    label: "Принято",
    variant: "outline",
    color: "text-green-600 border-green-600",
  },
  rejected: {
    label: "Отклонено",
    variant: "outline",
    color: "text-red-600 border-red-600",
  },
  expired: {
    label: "Истекло",
    variant: "outline",
    color: "text-gray-600 border-gray-600",
  },
};
