"use client";

import { useState } from "react";
import type { ClassItem, MockUser } from "@/types";
import { bookClass, joinWaitlist } from "@/lib/api";

type Props = {
  classInfo: ClassItem;
  currentUser: MockUser;
  onLocalUpdate: (updated: ClassItem) => void;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClassCard({ classInfo, currentUser, onLocalUpdate }: Props) {
  const [pending, setPending] = useState(false);
  const spotsLeft = classInfo.capacity - classInfo.bookedUserIds.length;
  const isFull = spotsLeft === 0;
  const isBooked = classInfo.bookedUserIds.includes(currentUser.id);
  const isOnWaitlist = classInfo.waitlistUserIds.includes(currentUser.id);
  const waitlistPosition = classInfo.waitlistUserIds.indexOf(currentUser.id) + 1;

  async function handleBook() {
    setPending(true);
    try {
      const updated = await bookClass(classInfo.id, currentUser.id);
      onLocalUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  }

  async function handleJoinWaitlist() {
    setPending(true);
    try {
      const updated = await joinWaitlist(classInfo.id, currentUser.id);
      onLocalUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {classInfo.name}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          with {classInfo.instructor}
        </p>
      </div>

      <div className="text-sm text-zinc-700 dark:text-zinc-300">
        <div>{formatWhen(classInfo.datetime)}</div>
        <div>
          {isFull
            ? `Full · ${classInfo.waitlistUserIds.length} on waitlist`
            : `${classInfo.bookedUserIds.length} of ${classInfo.capacity} booked · ${spotsLeft} spots left`}
        </div>
      </div>

      <div className="mt-1 flex gap-2">
        {!isFull && (
          <button
            onClick={handleBook}
            disabled={pending}
            aria-label={`Book ${classInfo.name} as ${currentUser.name}`}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Book
          </button>
        )}
        {isFull && !isBooked && !isOnWaitlist && (
          <button
            onClick={handleJoinWaitlist}
            disabled={pending}
            aria-label={`Join waitlist for ${classInfo.name} as ${currentUser.name}`}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Join Waitlist
          </button>
        )}
        {isFull && isOnWaitlist && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            #{waitlistPosition} on waitlist
          </span>
        )}
      </div>
    </div>
  );
}