import type { ClassItem } from "../types";
import { seedClasses } from "../data";

class AsyncQueue {
  private queue: Promise<unknown> = Promise.resolve();

  add<T>(fn: () => T): Promise<Awaited<T>> {
    this.queue = this.queue.then(() => fn());
    return this.queue as Promise<Awaited<T>>;
  }
}

type Store = {
  classes: ClassItem[];
};

const globalForStore = globalThis as unknown as { __bookingStore?: Store };
const writeQueue = new AsyncQueue();

function getStore(): Store {
  if (!globalForStore.__bookingStore) {
    globalForStore.__bookingStore = { classes: seedClasses() };
  }
  return globalForStore.__bookingStore;
}

export function getClasses(): ClassItem[] {
  return getStore().classes;
}

export function bookClass(classId: string, userId: string): Promise<ClassItem | null> {
  return writeQueue.add(async () => {
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
  });
}

export function cancelBooking(classId: string, userId: string): Promise<{ class: ClassItem; promotedUserId: string | null } | null> {
  return writeQueue.add(() => {
    const store = getStore();
    const cls = store.classes.find((c) => c.id === classId);
    if (!cls) return null;

    cls.bookedUserIds = cls.bookedUserIds.filter((id) => id !== userId);
    console.log("[cancel]", classId, "user:", userId, "→", cls.bookedUserIds.length, "of", cls.capacity);

    let promotedUserId: string | null = null;
    if (cls.waitlistUserIds.length > 0 && cls.bookedUserIds.length < cls.capacity) {
      promotedUserId = cls.waitlistUserIds.shift()!;
      cls.bookedUserIds.push(promotedUserId);
      console.log("[promote]", classId, "user:", promotedUserId, "promoted from waitlist");
    }

    return { class: cls, promotedUserId };
  });
}

export function joinWaitlist(classId: string, userId: string): Promise<ClassItem | null> {
  return writeQueue.add(() => {
    const store = getStore();
    const cls = store.classes.find((c) => c.id === classId);
    if (!cls) return null;
    if (cls.bookedUserIds.includes(userId)) return null;
    if (cls.waitlistUserIds.includes(userId)) return null;

    cls.waitlistUserIds.push(userId);
    console.log("[waitlist]", classId, "user:", userId, "→ position", cls.waitlistUserIds.length);
    return cls;
  });
}

export function leaveWaitlist(classId: string, userId: string): Promise<ClassItem | null> {
  return writeQueue.add(() => {
    const store = getStore();
    const cls = store.classes.find((c) => c.id === classId);
    if (!cls) return null;

    cls.waitlistUserIds = cls.waitlistUserIds.filter((id) => id !== userId);
    console.log("[waitlist-leave]", classId, "user:", userId);
    return cls;
  });
}
