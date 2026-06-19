import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/api/auth";
import { getToken, setToken } from "@/api/session";
import { getPendingInvite } from "@/lib/invite";
import { useOnline } from "@/hooks/use-online";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getToken()) {
      throw redirect({ to: "/app" });
    }
  },
  head: () => ({ meta: [{ title: "Entrar — Bolão Copa" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

type Form = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const online = useOnline();
  const { mutateAsync, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
    try {
      const res = await mutateAsync(values);
      setToken(res.access_token);
      setSession({ userId: res.user_id, displayName: res.display_name });
      const pending = getPendingInvite();
      navigate({ to: pending ? "/bolao/entrar" : "/app/historico" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar");
    }
  });

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <form
        onSubmit={onSubmit}
        className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta para ver seus bolões.</p>

        <div className="mt-8 space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@email.com"
            className="h-12 text-base"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-12 text-base"
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isPending || !online}
          className="mt-6 h-12 w-full gold-gradient text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </main>
  );
}
