import { describe, it, expect, beforeEach } from "vitest";
import { bookClass, cancelBooking, joinWaitlist, getClasses } from "./store";

beforeEach(() => {
  const g = globalThis as unknown as { __bookingStore?: unknown };
  delete g.__bookingStore;
});

describe("bookClass - concurrency", () => {
  it("should only allow one booking when two requests arrive simultaneously for the last spot", async () => {
    // HIIT-express class has capacity for 8 users and starts with 7 booked users — 1 spot left
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

describe("Muti-user / per-user isolation", () => {
  it("should only show each user their own bookings", async () => {
    await bookClass("yoga-morning", "u_alex");
    await bookClass("spin-evening", "u_sam");

    const classes = getClasses();
    const alexBookings = classes.filter((c) => c.bookedUserIds.includes("u_alex"));
    const samBookings = classes.filter((c) => c.bookedUserIds.includes("u_sam"));

    expect(alexBookings.map((c) => c.id)).toEqual(["yoga-morning"]);
    expect(samBookings.map((c) => c.id)).toEqual(["spin-evening"]);
  });

  it("should not remove another user's booking when one user cancels", async () => {
    await bookClass("yoga-morning", "u_alex");
    await bookClass("yoga-morning", "u_sam");
    await cancelBooking("yoga-morning", "u_alex");

    const cls = getClasses().find((c) => c.id === "yoga-morning")!;
    expect(cls.bookedUserIds).not.toContain("u_alex");
    expect(cls.bookedUserIds).toContain("u_sam");
  });

  it("should restore the available spot count after booking and canceling", async () => {
    const initialCount = getClasses().find((c) => c.id === "yoga-morning")!.bookedUserIds.length;

    await bookClass("yoga-morning", "u_alex");
    await cancelBooking("yoga-morning", "u_alex");

    const cls = getClasses().find((c) => c.id === "yoga-morning")!;
    expect(cls.bookedUserIds.length).toBe(initialCount);
    expect(cls.bookedUserIds).not.toContain("u_alex");
  });

  it("should reject a duplicate booking and keep the user listed only once", async () => {
    await bookClass("yoga-morning", "u_alex");
    await expect(bookClass("yoga-morning", "u_alex")).rejects.toThrow("You're already booked for this class.");

    const cls = getClasses().find((c) => c.id === "yoga-morning")!;
    const occurrences = cls.bookedUserIds.filter((id) => id === "u_alex").length;
    expect(occurrences).toBe(1);
  });
});

describe("Waitlist with auto-promote", () => {
  it("should move the promoted user from waitlistUserIds into bookedUserIds", async () => {
    const result = await cancelBooking("pilates-core", "4");

    expect(result.promotedUserId).toBe("u_jordan");
    expect(result.class.bookedUserIds).toContain("u_jordan");
    expect(result.class.waitlistUserIds).not.toContain("u_jordan");
  });

  it("should promote in FIFO order when multiple users are on the waitlist", async () => {
    await bookClass("hiit-express", "u_alex"); // now 8/8 — full
    await joinWaitlist("hiit-express", "u_jordan"); // position 1
    await joinWaitlist("hiit-express", "u_sam");    // position 2

    await cancelBooking("hiit-express", "u_alex");

    const cls = getClasses().find((c) => c.id === "hiit-express")!;
    expect(cls.bookedUserIds).toContain("u_jordan");
    expect(cls.waitlistUserIds).toEqual(["u_sam"]);
  });

  it("should free the spot without promoting anyone when the waitlist is empty", async () => {
    await bookClass("hiit-express", "u_alex");

    const result = await cancelBooking("hiit-express", "u_alex");

    expect(result.promotedUserId).toBeNull();
    expect(result.class.bookedUserIds).not.toContain("u_alex");
    expect(result.class.bookedUserIds.length).toBe(7);
  });

  it("should leave the promoted user as the sole booking after all original members cancel", async () => {
    await cancelBooking("pilates-core", "4");
    await cancelBooking("pilates-core", "5");
    await cancelBooking("pilates-core", "6");
    await cancelBooking("pilates-core", "7");
    await cancelBooking("pilates-core", "8");

    const cls = getClasses().find((c) => c.id === "pilates-core")!;
    expect(cls.bookedUserIds).toEqual(["u_jordan"]);
    expect(cls.waitlistUserIds).toHaveLength(0);
  });
});