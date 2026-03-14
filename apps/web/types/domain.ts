export type Role = "user" | "pro" | "admin";

export interface RequestScope {
  role: Role;
  userId: string;
  canReadAll: boolean;
  coachUserId?: string;
}

export interface AppSession {
  userId: string;
  role: Role;
  email: string;
  displayName: string;
}
