export type Role = "user" | "pro" | "admin";

export interface AppSession {
  userId: string;
  role: Role;
  email: string;
  displayName: string;
}

export interface RequestScope {
  userId: string;
  role: Role;
  canReadAll: boolean;
}
