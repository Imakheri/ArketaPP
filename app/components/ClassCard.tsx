"use client";

import { useState } from "react";
import type { ClassItem, MockUser } from "@/types";
import { bookClass, joinWaitlist } from "@/lib/api";

type Props = {
  classInfo: ClassItem;
  currentUser: MockUser;
  onLocalUpdate: (updated: ClassItem) => void;
  onError: (message: string) => void;
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

type Status = "past" | "booked" | "full" | "available";

function getStatus(classInfo: ClassItem, userId: string): Status {
  if (new Date(classInfo.datetime) < new Date()) return "past";
  if (classInfo.bookedUserIds.includes(userId)) return "booked";
  if (classInfo.bookedUserIds.length >= classInfo.capacity) return "full";
  return "available";
}

const STATUS_STYLES: Record<Status, string> = {
  past:      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  booked:    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  full:      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  available: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const STATUS_LABEL: Record<Status, string> = {
  past:      "Past",
  booked:    "Booked",
  full:      "Full",
  available: "Available",
};

export default function ClassCard({ classInfo, currentUser, onLocalUpdate, onError }: Props) {
  const [pending, setPending] = useState(false);
  const status = getStatus(classInfo, currentUser.id);
  const spotsLeft = classInfo.capacity - classInfo.bookedUserIds.length;
  const isOnWaitlist = classInfo.waitlistUserIds.includes(currentUser.id);
  const waitlistPosition = classInfo.waitlistUserIds.indexOf(currentUser.id) + 1;

  async function handleBook() {
    setPending(true);
    try {
      const updated = await bookClass(classInfo.id, currentUser.id);
      onLocalUpdate(updated);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Booking failed. Please try again.");
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
      onError(err instanceof Error ? err.message : "Could not join waitlist. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {classInfo.name}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            with {classInfo.instructor}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="text-sm text-zinc-700 dark:text-zinc-300">
        <div>{formatWhen(classInfo.datetime)}</div>
        <div>
          {status === "full"
            ? `Full · ${classInfo.waitlistUserIds.length} on waitlist`
            : `${classInfo.bookedUserIds.length} of ${classInfo.capacity} booked · ${spotsLeft} spots left`}
        </div>
      </div>

      <div className="mt-1 flex gap-2">
        {status === "available" && (
          <button
            onClick={handleBook}
            disabled={pending}
            aria-label={`Book ${classInfo.name} as ${currentUser.name}`}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Book
          </button>
        )}
        {status === "full" && !isOnWaitlist && (
          <button
            onClick={handleJoinWaitlist}
            disabled={pending}
            aria-label={`Join waitlist for ${classInfo.name} as ${currentUser.name}`}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Join Waitlist
          </button>
        )}
        {status === "full" && isOnWaitlist && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            #{waitlistPosition} on waitlist
          </span>
        )}
      </div>
    </div>
  );
}