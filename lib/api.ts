import type { ClassItem } from "../types";

async function parseError(res: Response): Promise<never> {
  const data = await res.json().catch(() => ({}));
  throw new Error(data.error ?? "Something went wrong.");
}

export async function fetchClasses(): Promise<ClassItem[]> {
  const res = await fetch("/api/classes", { cache: "no-store" });
  if (!res.ok) return parseError(res);
  const data = await res.json();
  return data.classes;
}

export async function bookClass(classId: string, userId: string): Promise<ClassItem> {
  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, userId }),
  });
  if (!res.ok) return parseError(res);
  const data = await res.json();
  return data.class;
}

export async function cancelBooking(classId: string, userId: string): Promise<{ class: ClassItem; promotedUserId: string | null }> {
  const res = await fetch("/api/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, userId }),
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function joinWaitlist(classId: string, userId: string): Promise<ClassItem> {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, userId }),
  });
  if (!res.ok) return parseError(res);
  const data = await res.json();
  return data.class;
}

export async function leaveWaitlist(classId: string, userId: string): Promise<ClassItem> {
  const res = await fetch("/api/waitlist", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, userId }),
  });
  if (!res.ok) return parseError(res);
  const data = await res.json();
  return data.class;
}