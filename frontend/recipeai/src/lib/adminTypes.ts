export type AdminRole = "USER" | "ADMIN";
export type SubscriptionPlan = "FREE" | "PAID";

export interface AdminUser {
  id: number;
  email: string;
  role: AdminRole;
  subscriptionPlan?: SubscriptionPlan;
}

export interface PageResponse<T> {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
}

export interface UserRecipeFilter {
  id: number;
  email: string;
}
