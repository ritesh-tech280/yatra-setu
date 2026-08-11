export type YatraRole = "organizer" | "sahayak" | "no_access";

export type UserRole = "organizer" | "sahayak";

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole; // User profile role
  createdAt: string;
  updatedAt?: string;
}

export interface YatraRoleInfo {
  role: YatraRole;
  isOrganizer: boolean;
  isSahayak: boolean;
  hasAccess: boolean;
  loading: boolean;
}

export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Other";

export type PaymentStatus = "Fully Paid" | "Partial" | "Pending";

export type ExpenseCategory =
  | "Transport / Bus"
  | "DJ"
  | "Food"
  | "Fuel"
  | "Accommodation"
  | "Water"
  | "Supplies / Material"
  | "Medical"
  | "Other";

export interface Yatra {
  id: string;
  name: string;
  startPlace: string;
  destination: string;
  startDate: string;
  endDate: string;
  fare: number;
  organizerId: string;
  organizerName: string;
  description?: string;
  sahayakIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  yatraId: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  yatraId: string;
  memberId: string; // empty string "" or "external" if external contribution
  isContribution?: boolean;
  contributorName?: string;
  contributorPhone?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  note?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  yatraId: string;
  category: ExpenseCategory | string;
  amount: number;
  expenseDate: string;
  paidBy: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface YatraStaff {
  id: string;
  uid: string;
  yatraId: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "sahayak";
  memberId?: string;
  status: "active" | "inactive";
  createdAt: string;
  joinedAt?: string;
  addedAt?: string;
  addedBy?: string;
}

// Alias for UI backwards compatibility
export type Sahayak = YatraStaff;

export interface YatraInvitation {
  id: string;
  token: string;
  yatraId: string;
  yatraName?: string;
  organizerName?: string;
  email: string;
  name?: string;
  phone?: string;
  memberId?: string;
  role: "sahayak";
  status: "pending" | "accepted" | "expired" | "canceled" | "revoked";
  invitedBy?: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedByUid?: string;
}

export interface MemberBalance {
  paid: number;
  remaining: number;
  status: PaymentStatus;
  paymentCount: number;
  lastPaymentDate?: string;
}

export interface FinancialSummary {
  totalMembers: number;
  expected: number; // members.length * fare
  collected: number; // total collected = memberCollected + contributions
  memberCollected: number; // fare payments collected from registered members
  contributions: number; // donations/contributions from external well-wishers
  outstanding: number; // total remaining dues from registered members
  expenses: number; // total expenses
  balance: number; // final net treasury balance = collected - expenses
  full: number;
  partial: number;
  pending: number;
  collectionPercentage: number;
  expensePercentage: number;
}
