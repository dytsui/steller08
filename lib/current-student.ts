const KEY = "steller08.currentStudentId";
const EVENT = "steller08:current-student";
const COOKIE = "steller08_current_student";

function readCookie() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : "";
}

export function getCurrentStudentId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) || readCookie() || "";
}

export function setCurrentStudentId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, id);
  document.cookie = `${COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id } }));
}

export function subscribeCurrentStudent(callback: (id: string) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id ?? getCurrentStudentId();
    callback(id);
  };
  window.addEventListener(EVENT, handler as EventListener);
  return () => window.removeEventListener(EVENT, handler as EventListener);
}
