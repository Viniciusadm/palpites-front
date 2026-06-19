import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/api/auth";
import { setToken } from "@/api/session";
import { getPendingInvite } from "@/lib/invite";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta — Bolão Copa" }] }),
  component: RegisterPage,
});

const schema = z.object({
  display_name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

type Form = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const { mutateAsync, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await mutateAsync(values);
      setToken(res.access_token);
      setSession({ userId: res.user_id, displayName: res.display_name });
      const pending = getPendingInvite();
      navigate({ to: pending ? "/bolao/entrar" : "/app/historico" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a conta");
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
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre-se para criar e participar de bolões.
        </p>

        <div className="mt-8 space-y-2">
          <Label htmlFor="display_name">Nome</Label>
          <Input
            id="display_name"
            placeholder="Seu nome"
            className="h-12 text-base"
            {...register("display_name")}
          />
          {errors.display_name && (
            <p className="text-xs text-destructive">{errors.display_name.message}</p>
          )}
        </div>

        <div className="mt-4 space-y-2">
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
          disabled={isPending}
          className="mt-6 h-12 w-full gold-gradient text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          {isPending ? "Criando..." : "Criar conta"}
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
