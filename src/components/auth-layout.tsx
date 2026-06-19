import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-5 py-8">
      <div className="relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-10">
        <Link to="/" className="mb-8">
          <Logo />
        </Link>
        {children}
      </div>
    </main>
  );
}
