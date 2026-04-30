import { Bell, BriefcaseBusiness, LogOut, Moon, Plus, Search, Settings, Sun, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Analytics from "./components/Analytics";
import Avatar from "./components/Avatar";
import KanbanBoard from "./components/KanbanBoard";
import ProfilePanel from "./components/ProfilePanel";
import ProjectDetails from "./components/ProjectDetails";
import ProjectPanel from "./components/ProjectPanel";
import TaskModal from "./components/TaskModal";
import ToastStack from "./components/ToastStack";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import { getSocket } from "./services/socket";

export default function App() {
  const { user, logout, updateProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [profileOpen, setProfileOpen] = useState(false);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("task_manager_theme") || "light");
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("task_manager_theme", theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/users")]).then(([projectRes, userRes]) => {
      setProjects(projectRes.data);
      setActiveProject(projectRes.data[0] || null);
      setUsers(userRes.data);
    });
  }, []);

  useEffect(() => {
    if (!activeProject) return;

    api.get(`/projects/${activeProject._id}/tasks`).then(({ data }) => setTasks(data));

    const socket = getSocket();
    socket.emit("project:join", activeProject._id);
    socket.on("task:created", (task) => {
      upsertTask(task);
      notify("New task added to the board", "success");
    });
    socket.on("task:updated", (task) => {
      upsertTask(task);
      notify("Task activity updated", "info");
    });
    socket.on("task:deleted", ({ id }) => {
      setTasks((items) => items.filter((task) => task._id !== id));
      notify("Task removed from board", "info");
    });

    return () => {
      socket.emit("project:leave", activeProject._id);
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
    };
  }, [activeProject?._id]);

  function notify(message, type = "info") {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 3500);
  }

  function dismissToast(id) {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }

  function upsertTask(task) {
    setTasks((items) => {
      const exists = items.some((item) => item._id === task._id);
      return exists ? items.map((item) => (item._id === task._id ? task : item)) : [task, ...items];
    });
  }

  function upsertProject(project) {
    setProjects((items) => items.map((item) => (item._id === project._id ? project : item)));
    setActiveProject(project);
  }

  async function createProject(payload) {
    const { data } = await api.post("/projects", payload);
    setProjects((items) => [data, ...items]);
    setActiveProject(data);
    notify("Project created", "success");
  }

  async function updateProject(payload) {
    const { data } = await api.patch(`/projects/${activeProject._id}`, payload);
    upsertProject(data);
    notify("Project details saved", "success");
  }

  async function addProjectMembers(members) {
    const { data } = await api.post(`/projects/${activeProject._id}/members`, { members });
    upsertProject(data);
    notify("Member added to project", "success");
  }

  async function removeProjectMember(userId) {
    const { data } = await api.delete(`/projects/${activeProject._id}/members/${userId}`);
    upsertProject(data);
    notify("Member removed from project");
  }

  async function deleteProject() {
    if (!window.confirm("Delete this project and hide it from the dashboard?")) return;
    await api.delete(`/projects/${activeProject._id}`);
    const nextProjects = projects.filter((project) => project._id !== activeProject._id);
    setProjects(nextProjects);
    setActiveProject(nextProjects[0] || null);
    setProjectDetailsOpen(false);
    notify("Project deleted");
  }

  async function createTask(payload) {
    const { data } = await api.post(`/projects/${activeProject._id}/tasks`, payload);
    upsertTask(data);
    setTaskModal({ open: false, task: null });
    notify("Task created", "success");
  }

  async function updateTask(payload) {
    const { data } = await api.patch(`/projects/${activeProject._id}/tasks/${taskModal.task._id}`, payload);
    upsertTask(data);
    setTaskModal({ open: false, task: null });
    notify("Task updated", "success");
  }

  async function moveTask(taskId, status) {
    const { data } = await api.patch(`/projects/${activeProject._id}/tasks/${taskId}`, { status });
    upsertTask(data);
    notify(`Task moved to ${status.replace("-", " ")}`);
  }

  async function addComment(taskId, body) {
    const { data } = await api.post(`/projects/${activeProject._id}/tasks/${taskId}/comments`, { body });
    upsertTask(data);
    setTaskModal((current) => ({ ...current, task: data }));
    notify("Comment added", "success");
  }

  async function uploadAttachment(taskId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/projects/${activeProject._id}/tasks/${taskId}/attachments`, formData);
    upsertTask(data);
    setTaskModal((current) => ({ ...current, task: data }));
    notify("Attachment uploaded", "success");
  }

  async function saveProfile(payload) {
    await updateProfile(payload);
    notify("Profile updated", "success");
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery = `${task.title} ${task.description} ${task.assignedTo?.name || ""}`.toLowerCase().includes(query.toLowerCase());
      const matchesPriority = priority === "all" || task.priority === priority;
      return matchesQuery && matchesPriority;
    });
  }, [tasks, query, priority]);

  const canManageProject = user?.role === "admin";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <BriefcaseBusiness size={24} />
          <div>
            <h1>TaskSphere</h1>
            <p>Team delivery suite</p>
          </div>
        </div>

        <ProjectPanel
          projects={projects}
          activeProject={activeProject}
          onSelect={setActiveProject}
          onCreate={createProject}
          canCreate={canManageProject}
        />
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace Overview</p>
            <h2>{activeProject?.title || "No project yet"}</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn light" onClick={() => notify("No unread notifications")} title="Notifications"><Bell size={18} /></button>
            <button className="icon-btn light" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="profile-button" onClick={() => setProfileOpen(true)}>
              <Avatar user={user} />
              <span>{user?.name}</span>
            </button>
            <button className="icon-btn light" onClick={logout} title="Log out"><LogOut size={18} /></button>
          </div>
        </header>

        <section className="project-hero">
          <div>
            <span className={`status-badge ${activeProject?.status || "active"}`}>{activeProject?.status || "active"}</span>
            <h2>{activeProject?.title || "Create your first project"}</h2>
            <p>{activeProject?.description || "Use an admin account to create a project or run the seed command to load demo data."}</p>
          </div>
          <div className="hero-actions">
            <button disabled={!activeProject} className="secondary-btn" onClick={() => setProjectDetailsOpen(true)}>
              <Settings size={18} /> Project details
            </button>
            <button disabled={!activeProject} className="primary-btn" onClick={() => setTaskModal({ open: true, task: null })}>
              <Plus size={18} /> New task
            </button>
          </div>
        </section>

        <Analytics tasks={tasks} />

        <div className="filter-bar">
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, descriptions, assignees" />
          </label>
          <select className="select" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <KanbanBoard tasks={filteredTasks} onMove={moveTask} onOpenTask={(task) => setTaskModal({ open: true, task })} />
      </section>

      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          project={activeProject}
          onClose={() => setTaskModal({ open: false, task: null })}
          onSubmit={taskModal.task ? updateTask : createTask}
          onComment={addComment}
          onUpload={uploadAttachment}
        />
      )}

      {projectDetailsOpen && activeProject && (
        <ProjectDetails
          project={activeProject}
          users={users}
          tasks={tasks}
          canManage={canManageProject}
          onUpdate={updateProject}
          onAddMembers={addProjectMembers}
          onRemoveMember={removeProjectMember}
          onDelete={deleteProject}
          onClose={() => setProjectDetailsOpen(false)}
        />
      )}

      {profileOpen && <ProfilePanel user={user} onSave={saveProfile} onClose={() => setProfileOpen(false)} />}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
