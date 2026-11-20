import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import Logo from "@/components/Logo";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="mb-10 flex items-center gap-4">
        <Link href="/" className="nb-btn inline-block">
          Back
        </Link>
        <Logo />
      </div>
      <AuthForm />
    </main>
  );
}