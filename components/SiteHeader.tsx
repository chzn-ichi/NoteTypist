"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Logo from "@/components/Logo";
import { useDismiss } from "@/hooks/useDismiss";
import { createClient } from "@/lib/supabase/client";
import { toggleTheme } from "@/lib/theme";

const NAV = [
  { href: "/notes", label: "My notes" },
  { href: "/history", label: "History" },
];

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useDismiss(open, menuRef, () => setOpen(false));

  // Who is logged in? Updates automatically on login and logout.
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function logOut() {
    setOpen(false);
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const onHome = pathname === "/";

  return (
    <header className="flex items-center gap-6 py-5">
      <Link href="/" aria-label="NoteTypist home" className="shrink-0">
        <Logo />
      </Link>

      {user && (
        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nb-link ${pathname.startsWith(item.href) ? "nb-link-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        {!ready ? (
          <div className="h-10 w-28" />
        ) : user ? (
          <>
            {!pathname.startsWith("/new") && (
              // On the home page the big button below is the main one, so this one stays quiet
              <Link href="/new" className={onHome ? "nb-btn" : "nb-btn nb-btn-primary"}>
                Create notes
              </Link>
            )}

            <div className="relative" ref={menuRef}>
              <button
                className="nb-avatar font-heading"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                {initial}
              </button>

              {open && (
                <div className="nb-menu" role="menu">
                  <p className="truncate px-2.5 pb-1 pt-1.5 text-sm text-muted">{user.email}</p>

                  {/* On small screens the header links live in this menu */}
                  <div className="sm:hidden">
                    <hr />
                    {NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className="nb-menu-item"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <hr />
                  <button
                    role="menuitem"
                    className="nb-menu-item"
                    onClick={() => {
                      toggleTheme();
                      setOpen(false);
                    }}
                  >
                    Switch theme
                  </button>
                  <button role="menuitem" className="nb-menu-item" onClick={logOut}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          pathname !== "/login" && (
            <>
              <button className="nb-link" onClick={toggleTheme}>
                Switch theme
              </button>
              <Link href="/login" className="nb-btn">
                Log in
              </Link>
            </>
          )
        )}
      </div>
    </header>
  );
}