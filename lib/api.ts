import type { ClassItem } from "../types";

export async function fetchClasses(): Promise<ClassItem[]> {
  const res = await fetch("/api/classes", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch classes");
  const data = await res.json();
  return data.classes;
}

export async function bookClass(classId: string, userId: string): Promise<ClassItem> {
  try {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, userId }),
    });
    if (!res.ok) throw new Error("Booking failed");
    const data = await res.json();
    return data.class;
  } catch (err) {
    console.error("bookClass error", err);
    throw err;
  }
}

export async function cancelBooking(classId: string, userId: string): Promise<{ class: ClassItem; promotedUserId: string | null }> {
  try {
    const res = await fetch("/api/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, userId }),
    });
    if (!res.ok) throw new Error("Cancel failed");
    return await res.json();
  } catch (err) {
    console.error("cancelBooking error", err);
    throw err;
  }
}

export async function joinWaitlist(classId: string, userId: string): Promise<ClassItem> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, userId }),
    });
    if (!res.ok) throw new Error("Join waitlist failed");
    const data = await res.json();
    return data.class;
  } catch (err) {
    console.error("joinWaitlist error", err);
    throw err;
  }
}

export async function leaveWaitlist(classId: string, userId: string): Promise<ClassItem> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, userId }),
    });
    if (!res.ok) throw new Error("Leave waitlist failed");
    const data = await res.json();
    return data.class;
  } catch (err) {
    console.error("leaveWaitlist error", err);
    throw err;
  }
}
