"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Sends logged-out visitors to the login page, then back to nextPath after they log in.
// Returns true once we know someone is logged in.
export function useRequireUser(nextPath: string) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setReady(true);
        else router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      });
  }, [router, nextPath]);

  return ready;
}