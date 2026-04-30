import { X } from "lucide-react";
import { useState } from "react";
import Avatar from "./Avatar";

export default function ProfilePanel({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    title: user?.title || "",
    department: user?.department || "",
    avatarColor: user?.avatarColor || "#2563eb"
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSave(form);
    onClose();
  }

  return (
    <div className="drawer-backdrop">
      <aside className="drawer">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Personal settings</h2>
          </div>
          <button className="icon-btn light" onClick={onClose} title="Close"><X size={18} /></button>
        </div>

        <div className="profile-preview">
          <Avatar user={{ ...user, ...form }} size="lg" />
          <div>
            <h3>{form.name || user?.name}</h3>
            <p>{form.title || "Team Member"} - {form.department || "Product"}</p>
          </div>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Name" required />
          <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Job title" />
          <input value={form.department} onChange={(event) => update("department", event.target.value)} placeholder="Department" />
          <label className="color-field">
            <span>Avatar color</span>
            <input type="color" value={form.avatarColor} onChange={(event) => update("avatarColor", event.target.value)} />
          </label>
          <button className="primary-btn justify-center">Save profile</button>
        </form>
      </aside>
    </div>
  );
}
