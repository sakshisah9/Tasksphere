import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "./Login";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    }
  }

  return (
    <AuthLayout title="Create workspace access" subtitle="Use admin for project setup or member for task execution.">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} />
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button className="primary-btn w-full justify-center">Sign up</button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        Already registered? <Link className="font-medium text-brand" to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
