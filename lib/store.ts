import type { ClassItem } from "../types";
import { seedClasses } from "../data";

type Store = {
  classes: ClassItem[];
};

const globalForStore = globalThis as unknown as { __bookingStore?: Store };

function getStore(): Store {
  if (!globalForStore.__bookingStore) {
    globalForStore.__bookingStore = { classes: seedClasses() };
  }
  return globalForStore.__bookingStore;
}

export function getClasses(): ClassItem[] {
  return getStore().classes;
}

export async function bookClass(classId: string, userId: string): Promise<ClassItem | null> {
  const store = getStore();
  const cls = store.classes.find((c) => c.id === classId);
  if (!cls) return null;

  if (cls.bookedUserIds.includes(userId)) return null;

  const classDate = new Date(cls.datetime);
  if (classDate.getTime() < Date.now()) return null;

  // simulates async latency (e.g. a DB call) — creates the window for a race condition
  await Promise.resolve();

  cls.bookedUserIds.push(userId);
  console.log("[book]", classId, "user:", userId, "→", cls.bookedUserIds.length, "of", cls.capacity);
  return cls;
}

export function cancelBooking(classId: string, userId: string): ClassItem | null {
  const store = getStore();
  const cls = store.classes.find((c) => c.id === classId);
  if (!cls) return null;

  cls.bookedUserIds = cls.bookedUserIds.filter((id) => id !== userId);
  console.log("[cancel]", classId, "user:", userId, "→", cls.bookedUserIds.length, "of", cls.capacity);
  return cls;
}
