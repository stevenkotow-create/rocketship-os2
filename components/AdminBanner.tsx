"use client";

import { useEffect, useState } from "react";
import { getActingAs, clearActingAs } from "@/lib/storage";

// When an admin has opened another user's board, this fixed banner makes it
// unmistakable whose data they're editing, with a one-click exit.
export function AdminBanner() {
  const [acting, setActing] = useState<{ userId: string; email: string } | null>(null);

  useEffect(() => {
    setActing(getActingAs());
  }, []);

  if (!acting) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 bg-accent px-4 py-2 text-[13px] text-white shadow-sm">
      <span>
        You&apos;re editing <span className="font-semibold">{acting.email}</span>&apos;s board. Changes save to their account.
      </span>
      <button
        onClick={clearActingAs}
        className="rounded-md bg-white/20 px-3 py-1 font-semibold hover:bg-white/30"
      >
        Exit to my board
      </button>
    </div>
  );
}
