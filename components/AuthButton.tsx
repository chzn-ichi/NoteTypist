"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Who is logged in right now?
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });

    // Update automatically whenever someone logs in or out
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function logOut() {
    await createClient().auth.signOut();
    router.refresh();
  }

  // Empty space of the same size, so the header does not jump around
  if (!ready) return <div className="h-10 w-24" />;

  if (!user) {
    return (
      <Link href="/login" className="nb-btn nb-btn-primary inline-block">
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[18ch] truncate text-sm text-muted sm:block">
        {user.email}
      </span>
      <Link href="/history" className="nb-btn inline-block">
        History
      </Link>
      <button className="nb-btn" onClick={logOut}>
        Log out
      </button>
    </div>
  );
}