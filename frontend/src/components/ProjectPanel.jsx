import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";

export default function ProjectPanel({ projects, activeProject, onSelect, onCreate, canCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    await onCreate({ title, description });
    setTitle("");
    setDescription("");
  }

  return (
    <aside className="space-y-4">
      <div className="panel">
        <div className="mb-3 flex items-center gap-2">
          <FolderKanban size={19} />
          <h2 className="font-semibold">Projects</h2>
        </div>
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              className={`project-row ${activeProject?._id === project._id ? "active" : ""}`}
              key={project._id}
              onClick={() => onSelect(project)}
            >
              <span>{project.title}</span>
              <small>{project.members?.length || 0} members</small>
            </button>
          ))}
          {!projects.length && <p className="text-sm text-slate-500">No projects yet.</p>}
        </div>
      </div>

      {canCreate && (
        <form className="panel space-y-3" onSubmit={handleSubmit}>
          <h3 className="font-semibold">New project</h3>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project title" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" rows={3} />
          <button className="primary-btn w-full justify-center"><Plus size={17} /> Create</button>
        </form>
      )}
    </aside>
  );
}
