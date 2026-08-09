import type { Yatra, Member, Payment, Expense, Sahayak, UserProfile, UserRole } from "@/types/yatra";

// Helper for unified API calls
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `HTTP error ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

// ---------------- AUTH REST APIS ----------------
export const authApi = {
  login: async (email: string, password?: string): Promise<UserProfile> => {
    const res = await apiRequest<{ success: boolean; user: UserProfile }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return res.user;
  },

  register: async (name: string, email: string, role: UserRole, phone?: string): Promise<UserProfile> => {
    const res = await apiRequest<{ success: boolean; user: UserProfile }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, role, phone }),
    });
    return res.user;
  },
};

// ---------------- YATRA REST APIS ----------------
export const yatraApi = {
  getAll: async (userId?: string): Promise<Yatra[]> => {
    const url = userId ? `/api/yatras?userId=${encodeURIComponent(userId)}` : "/api/yatras";
    return apiRequest<Yatra[]>(url);
  },

  getById: async (id: string): Promise<Yatra> => {
    return apiRequest<Yatra>(`/api/yatras/${id}`);
  },

  create: async (data: Omit<Yatra, "id" | "createdAt" | "updatedAt">): Promise<Yatra> => {
    return apiRequest<Yatra>("/api/yatras", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, updates: Partial<Yatra>): Promise<Yatra> => {
    return apiRequest<Yatra>(`/api/yatras/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/api/yatras/${id}`, {
      method: "DELETE",
    });
  },
};

// ---------------- MEMBERS REST APIS ----------------
export const memberApi = {
  getByYatra: async (yatraId: string): Promise<Member[]> => {
    return apiRequest<Member[]>(`/api/members?yatraId=${encodeURIComponent(yatraId)}`);
  },

  create: async (data: { yatraId: string; name: string; phone: string; address?: string; notes?: string }): Promise<Member> => {
    return apiRequest<Member>("/api/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, updates: Partial<Member>): Promise<Member> => {
    return apiRequest<Member>(`/api/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/api/members/${id}`, {
      method: "DELETE",
    });
  },
};

// ---------------- PAYMENTS REST APIS ----------------
export const paymentApi = {
  getByYatra: async (yatraId: string): Promise<Payment[]> => {
    return apiRequest<Payment[]>(`/api/payments?yatraId=${encodeURIComponent(yatraId)}`);
  },

  create: async (data: {
    yatraId: string;
    memberId: string;
    amount: number;
    paymentMethod: Payment["paymentMethod"];
    paymentDate?: string;
    note?: string;
    createdBy?: string;
    createdByName?: string;
  }): Promise<Payment> => {
    return apiRequest<Payment>("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/api/payments/${id}`, {
      method: "DELETE",
    });
  },
};

// ---------------- EXPENSES REST APIS ----------------
export const expenseApi = {
  getByYatra: async (yatraId: string): Promise<Expense[]> => {
    return apiRequest<Expense[]>(`/api/expenses?yatraId=${encodeURIComponent(yatraId)}`);
  },

  create: async (data: {
    yatraId: string;
    category: string;
    amount: number;
    expenseDate?: string;
    paidBy: string;
    description?: string;
    createdBy?: string;
  }): Promise<Expense> => {
    return apiRequest<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    return apiRequest<Expense>(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/api/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

// ---------------- SAHAYAKS REST APIS ----------------
export const sahayakApi = {
  getByYatra: async (yatraId: string): Promise<Sahayak[]> => {
    return apiRequest<Sahayak[]>(`/api/sahayaks?yatraId=${encodeURIComponent(yatraId)}`);
  },

  create: async (data: {
    yatraId: string;
    name: string;
    phone: string;
    email?: string;
    addedBy?: string;
  }): Promise<Sahayak> => {
    return apiRequest<Sahayak>("/api/sahayaks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/api/sahayaks/${id}`, {
      method: "DELETE",
    });
  },
};
