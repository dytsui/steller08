export type AuthSession = {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: "user" | "pro" | "admin";
  } | null;
};

export async function fetchAuthSession(): Promise<AuthSession> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  if (!res.ok) return { user: null };
  return res.json();
}

export async function loginWithPassword(input: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function registerAccount(input: { email: string; password: string; displayName: string; role: "user" | "pro" }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function logoutSession() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  return res.json();
}
