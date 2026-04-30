import { AlertTriangle, CheckCircle2, Trash2, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import Avatar from "./Avatar";

export default function ProjectDetails({ project, users, tasks, canManage, onUpdate, onAddMembers, onRemoveMember, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: project?.title || "",
    description: project?.description || "",
    status: project?.status || "active"
  });
  const [selectedMember, setSelectedMember] = useState("");

  const progress = useMemo(() => {
    const done = tasks.filter((task) => task.status === "done").length;
    return tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  }, [tasks]);

  const availableUsers = users.filter((user) => !project.members?.some((member) => member._id === user._id));

  async function saveProject(event) {
    event.preventDefault();
    await onUpdate(form);
  }

  async function addMember(event) {
    event.preventDefault();
    if (!selectedMember) return;
    await onAddMembers([selectedMember]);
    setSelectedMember("");
  }

  return (
    <div className="drawer-backdrop">
      <aside className="drawer wide">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Project Details</p>
            <h2>{project.title}</h2>
          </div>
          <button className="icon-btn light" onClick={onClose} title="Close"><X size={18} /></button>
        </div>

        <div className="progress-card">
          <div>
            <p className="eyebrow">Completion</p>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <p>{tasks.length} tasks tracked across this project.</p>
        </div>

        <form className="grid gap-3" onSubmit={saveProject}>
          <input disabled={!canManage} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea disabled={!canManage} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
          <select disabled={!canManage} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>
          {canManage && <button className="primary-btn justify-center">Save project</button>}
        </form>

        <section className="drawer-section">
          <h3>Members</h3>
          <div className="member-list">
            {project.members?.map((member) => (
              <div className="member-row" key={member._id}>
                <Avatar user={member} />
                <div>
                  <strong>{member.name}</strong>
                  <p>{member.title || member.role}</p>
                </div>
                {canManage && member._id !== project.owner?._id && (
                  <button className="icon-btn danger" onClick={() => onRemoveMember(member._id)} title="Remove member"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <form className="member-add" onSubmit={addMember}>
              <select value={selectedMember} onChange={(event) => setSelectedMember(event.target.value)}>
                <option value="">Add member</option>
                {availableUsers.map((user) => <option value={user._id} key={user._id}>{user.name}</option>)}
              </select>
              <button className="secondary-btn"><UserPlus size={17} /> Add</button>
            </form>
          )}
        </section>

        {canManage && (
          <button className="danger-zone" onClick={onDelete}>
            <AlertTriangle size={18} /> Delete project
          </button>
        )}

        <div className="status-note">
          <CheckCircle2 size={17} /> Project status and membership sync with the main dashboard immediately.
        </div>
      </aside>
    </div>
  );
}
