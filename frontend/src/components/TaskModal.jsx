import { format } from "date-fns";
import { Paperclip, Send, Upload, X } from "lucide-react";
import { useState } from "react";
import Avatar from "./Avatar";

const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  deadline: "",
  assignedTo: ""
};

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function TaskModal({ task, project, onClose, onSubmit, onComment, onUpload }) {
  const fileBaseUrl = (import.meta.env.VITE_SOCKET_URL || "http://localhost:5001").replace("localhost:5000", "localhost:5001");
  const [form, setForm] = useState({
    ...emptyTask,
    ...task,
    deadline: toDateInput(task?.deadline),
    assignedTo: task?.assignedTo?._id || ""
  });
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const isEditing = Boolean(task?._id);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      deadline: form.deadline,
      assignedTo: form.assignedTo
    });
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await onComment(task._id, comment);
    setComment("");
  }

  async function submitFile(event) {
    event.preventDefault();
    if (!file) return;
    await onUpload(task._id, file);
    setFile(null);
  }

  return (
    <div className="modal-backdrop">
      <form className="task-modal" onSubmit={handleSubmit}>
        <div className="modal-main">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">{isEditing ? "Task Details" : "Create Task"}</p>
              <h2 className="text-xl font-semibold">{isEditing ? task.title : "New work item"}</h2>
            </div>
            <button type="button" className="icon-btn light" onClick={onClose} title="Close"><X size={18} /></button>
          </div>

          <div className="grid gap-3">
            <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Task title" required />
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Description" rows={5} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select value={form.priority} onChange={(event) => update("priority", event.target.value)}>
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <select value={form.status} onChange={(event) => update("status", event.target.value)}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select value={form.assignedTo} onChange={(event) => update("assignedTo", event.target.value)}>
                <option value="">Unassigned</option>
                {project?.members?.map((member) => (
                  <option value={member._id} key={member._id}>{member.name}</option>
                ))}
              </select>
              <input type="date" value={form.deadline} onChange={(event) => update("deadline", event.target.value)} />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button className="primary-btn">{isEditing ? "Save changes" : "Create task"}</button>
          </div>

          {isEditing && (
            <section className="task-collab">
              <form className="comment-form" onSubmit={submitComment}>
                <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a project comment" />
                <button className="icon-btn" title="Post comment"><Send size={16} /></button>
              </form>

              <form className="upload-form" onSubmit={submitFile}>
                <label>
                  <Upload size={17} />
                  <span>{file?.name || "Choose attachment"}</span>
                  <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                </label>
                <button className="secondary-btn" disabled={!file}>Upload</button>
              </form>

              <div className="attachment-list">
                {task.attachments?.map((attachment) => (
                  <a href={`${fileBaseUrl}${attachment.url}`} target="_blank" rel="noreferrer" key={attachment._id}>
                    <Paperclip size={15} /> {attachment.name}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {isEditing && (
          <aside className="timeline-panel">
            <h3>Activity timeline</h3>
            <div className="timeline">
              {task.activity?.slice().reverse().map((item) => (
                <div className="timeline-item" key={item._id}>
                  <Avatar user={item.actor} size="sm" />
                  <div>
                    <strong>{item.actor?.name || "Team member"}</strong>
                    <p>{item.action}{item.from && item.to ? ` from ${item.from} to ${item.to}` : ""}</p>
                    <small>{item.createdAt ? format(new Date(item.createdAt), "MMM d, h:mm a") : "Just now"}</small>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </form>
    </div>
  );
}
