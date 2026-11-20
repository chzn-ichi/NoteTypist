import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/SiteHeader";

type Props = {
  children: React.ReactNode;
  wide?: boolean; // full width, for the home page
  narrow?: boolean; // small centered column, for the login form
  back?: { href: string; label: string };
};

export default function Page({ children, wide = false, narrow = false, back }: Props) {
  const column = wide ? "" : narrow ? "mx-auto max-w-md" : "mx-auto max-w-3xl";

  return (
    <div className="mx-auto w-full max-w-5xl px-5">
      {/* While the header loads, show just the logo in the same space so nothing jumps */}
      <Suspense
        fallback={
          <div className="flex h-20 items-center">
            <Logo />
          </div>
        }
      >
        <SiteHeader />
      </Suspense>

      <main className={`pb-20 pt-6 ${column}`}>
        {back && (
          <Link href={back.href} className="nb-link mb-6">
            {back.label}
          </Link>
        )}
        {children}
      </main>
    </div>
  );
}