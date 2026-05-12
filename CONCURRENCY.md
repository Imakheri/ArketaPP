# Concurrency Safety — Trade-off Analysis

## The Problem

The in-memory store was vulnerable to race conditions. `bookClass` performs a read (check if user is already booked) and a write (push to `bookedUserIds`) as two separate steps. An `await` between them creates a window where a second concurrent request can pass the check before the first one has finished writing.

**Demonstrated scenario:** A user double-clicks "Book" from two browser tabs simultaneously — both requests pass the check before either writes, and the user ends up booked twice.

---

## Solution: Async Queue

Every write operation is wrapped in a shared `AsyncQueue` that chains calls one after another, guaranteeing serial execution.

**Pros:** Simple, no external libraries, easy to read, guaranteed ordering.

**Cons:** All writes are serialized regardless of which class they target. Does not scale across multiple server instances — each process would have its own queue and the race condition would reappear. If the system ever migrates to a shared database, concurrency should be handled at the database level instead.