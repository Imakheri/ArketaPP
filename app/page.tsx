"use client";

import { useEffect, useState } from "react";
import type { ClassItem, MockUser } from "@/types";
import { fetchClasses } from "@/lib/api";
import { MOCK_USERS } from "@/lib/users";
import ClassList from "./components/ClassList";
import MyBookings from "./components/MyBookings";

export default function Home() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [currentUser, setCurrentUser] = useState<MockUser>(MOCK_USERS[0]);
  const [loading, setLoading] = useState(true);
  const [promotionMessage, setPromotionMessage] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ userId: string; className: string } | null>(null);

  useEffect(() => {
    fetchClasses()
      .then(setClasses)
      .catch((err) => console.error("Failed to load classes", err))
      .finally(() => setLoading(false));
  }, []);

  function handleLocalUpdate(updated: ClassItem) {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  useEffect(() => {
    if (pendingPromotion && currentUser.id === pendingPromotion.userId) {
      setPromotionMessage(`You've been promoted from the waitlist for ${pendingPromotion.className} and now have a confirmed spot!`);
      setPendingPromotion(null);
      setTimeout(() => setPromotionMessage(null), 60000);
    }
  }, [currentUser, pendingPromotion]);

  function handlePromotion(promotedUserId: string, className: string) {
    setPendingPromotion({ userId: promotedUserId, className });
  }

  return (
    <main className="mx-auto w-full max-w-5xl">
      {promotionMessage && (
        <div className="mx-6 mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {promotionMessage}
        </div>
      )}
      <ClassList
        classes={classes}
        loading={loading}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onLocalUpdate={handleLocalUpdate}
      />
      <MyBookings
        classes={classes}
        currentUser={currentUser}
        onClassUpdate={handleLocalUpdate}
        onPromotion={handlePromotion}
      />
    </main>
  );
}
