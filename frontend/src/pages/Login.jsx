import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage project work with your team.">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <button className="primary-btn w-full justify-center">Login</button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        New team? <Link className="font-medium text-brand" to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="grid min-h-screen bg-cloud lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8 rounded-lg border border-line bg-white p-6 shadow-panel">{children}</div>
        </div>
      </section>
      <section className="hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <h2 className="text-4xl font-semibold">Plan, assign, ship.</h2>
          <p className="mt-4 max-w-lg text-slate-300">A focused Kanban workspace with project membership, live task updates, comments, and progress visibility.</p>
        </div>
        <div className="grid gap-3">
          {["Role-based project control", "Live task status movement", "Team comments and activity history"].map((item) => (
            <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-4" key={item}>
              <CheckCircle2 className="text-mint" size={20} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
