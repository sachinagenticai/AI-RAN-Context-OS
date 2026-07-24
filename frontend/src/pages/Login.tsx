import { useMutation } from "@tanstack/react-query";
import { AlertCircle, LockKeyhole, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("ops.lead@nokia-demo");
  const [password, setPassword] = useState("demo-password");

  const mutation = useMutation({
    mutationFn: ({ user, pass }: { user: string; pass: string }) => login(user, pass),
    onSuccess: (token: string) => {
      localStorage.setItem("airan_token", token);
      navigate("/dashboard", { replace: true });
    }
  });

  useEffect(() => {
    if (localStorage.getItem("airan_token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    mutation.mutate({ user: username, pass: password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-panel backdrop-blur">
        <div className="grid md:grid-cols-2">
          <section className="bg-ink p-8 text-white md:p-10">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-300">Enterprise Access</p>
            <h1 className="mt-3 font-display text-3xl leading-tight">AI-RAN Context OS Control Plane</h1>
            <p className="mt-4 text-sm text-slate-300">
              Securely access live context intelligence for autonomous radio operations, policy impact,
              and incident mitigation workflows.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/20 p-3">Zero-Touch Investigation</div>
              <div className="rounded-xl border border-white/20 p-3">Cross-Domain Causality</div>
              <div className="rounded-xl border border-white/20 p-3">Policy-Aware Actions</div>
              <div className="rounded-xl border border-white/20 p-3">Telecom Reliability KPIs</div>
            </div>
          </section>

          <section className="p-8 md:p-10">
            <h2 className="font-display text-2xl text-ink">Sign In</h2>
            <p className="mt-2 text-sm text-slate-600">Use your operations identity to continue.</p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Username</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:shadow-focus">
                  <UserRound size={16} className="text-slate-500" />
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:shadow-focus">
                  <LockKeyhole size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border-0 bg-transparent text-sm outline-none"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {mutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle size={16} />
                  Authentication failed. Check credentials and retry.
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-sky to-aqua px-4 py-3 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mutation.isPending ? "Authenticating..." : "Enter Control Plane"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
