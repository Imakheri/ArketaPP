import { describe, it, expect, beforeEach } from "vitest";
import { bookClass, getClasses } from "./store";

beforeEach(() => {
  const g = globalThis as unknown as { __bookingStore?: unknown };
  delete g.__bookingStore;
});

describe("bookClass - concurrency", () => {
  it("should only allow one booking when two requests arrive simultaneously for the last spot", async () => {
    // pilates-core class has capacity for 5 users and starts with 4 booked users — 1 spot left
    const classId = "pilates-core";

    const [result1, result2] = await Promise.all([
      bookClass(classId, "u_alex"),
      bookClass(classId, "u_jordan"),
    ]);

    const successCount = [result1, result2].filter(Boolean).length;

    expect(successCount).toBe(1);

    const cls = getClasses().find((c) => c.id === classId)!;
    expect(cls.bookedUserIds.length).toBe(cls.capacity);
  });
});