import { describe, it, expect, beforeEach } from "vitest";
import { bookClass, getClasses } from "./store";

beforeEach(() => {
  const g = globalThis as unknown as { __bookingStore?: unknown };
  delete g.__bookingStore;
});

describe("bookClass - concurrency", () => {
  it("should only allow one booking when two requests arrive simultaneously for the last spot", async () => {
    // hiit-express has capacity 8 and starts with 7 booked users — 1 spot left
    const classId = "hiit-express";

    const results = await Promise.allSettled([
      bookClass(classId, "u_alex"),
      bookClass(classId, "u_alex"),
    ]);

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    expect(successCount).toBe(1);

    const cls = getClasses().find((c) => c.id === classId)!;
    expect(cls.bookedUserIds.length).toBe(cls.capacity);
  });
});
