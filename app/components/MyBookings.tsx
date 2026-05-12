"use client";

import type { ClassItem, MockUser } from "@/types";
import BookedClassRow from "./BookedClassItem";
import WaitlistItem from "./WaitlistItem";

type Props = {
  classes: ClassItem[];
  currentUser: MockUser;
  onClassUpdate: (updated: ClassItem) => void;
  onPromotion: (promotedUserId: string, className: string) => void;
};

export default function MyBookings({ classes, currentUser, onClassUpdate, onPromotion }: Props) {
  const bookedClasses = classes.filter((c) => c.bookedUserIds.includes(currentUser.id));
  const waitlistedClasses = classes.filter((c) => c.waitlistUserIds.includes(currentUser.id));

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-10">
      <div className="flex flex-col gap-3">
        <header>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">My Bookings</h2>
        </header>
        {bookedClasses.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No bookings yet.</p>
        ) : (
          bookedClasses.map((c) => (
            <BookedClassRow
              key={c.id}
              classInfo={c}
              currentUser={currentUser}
              onClassUpdate={onClassUpdate}
              onPromotion={onPromotion}
            />
          ))
        )}
      </div>

      {waitlistedClasses.length > 0 && (
        <div className="flex flex-col gap-3">
          <header>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">My Waitlist</h2>
          </header>
          {waitlistedClasses.map((c) => (
            <WaitlistItem
              key={c.id}
              classInfo={c}
              currentUser={currentUser}
              onClassUpdate={onClassUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}