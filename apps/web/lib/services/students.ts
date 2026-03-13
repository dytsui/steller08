import type { Student } from "@/lib/types";

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch("/api/students", { cache: "no-store" });
  const json = await res.json();
  return json.students ?? [];
}

export async function saveStudent(student: Partial<Student>) {
  const method = student.id ? "PATCH" : "POST";
  const res = await fetch("/api/students", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student)
  });
  return await res.json();
}
