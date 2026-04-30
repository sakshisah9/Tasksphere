import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast } from "date-fns";
import { CalendarDays, GripVertical, MessageSquare, Paperclip } from "lucide-react";
import Avatar from "./Avatar";

const columns = [
  { id: "todo", title: "Todo", hint: "Ready for planning" },
  { id: "in-progress", title: "In Progress", hint: "Currently moving" },
  { id: "done", title: "Done", hint: "Completed work" }
];

export default function KanbanBoard({ tasks, onMove, onOpenTask }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((item) => item._id === active.id);
    const nextStatus = over.data.current?.status || over.id;

    if (task && task.status !== nextStatus) onMove(task._id, nextStatus);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="kanban-grid">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <KanbanColumn key={column.id} column={column} tasks={columnTasks} onOpenTask={onOpenTask} />
          );
        })}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ column, tasks, onOpenTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { status: column.id } });

  return (
    <section className={`kanban-column ${isOver ? "over" : ""}`} ref={setNodeRef}>
      <div className="column-header">
        <div>
          <h3>{column.title}</h3>
          <p>{column.hint}</p>
        </div>
        <span className="count-pill">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task._id)}>
        <div className="space-y-3">
          {tasks.map((task) => <TaskCard key={task._id} task={task} onOpenTask={onOpenTask} />)}
          {!tasks.length && <div className="empty-state">Drop tasks here</div>}
        </div>
      </SortableContext>
    </section>
  );
}

function TaskCard({ task, onOpenTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { status: task.status }
  });

  const overdue = task.deadline && task.status !== "done" && isPast(new Date(task.deadline));
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <article className={`task-card ${isDragging ? "dragging" : ""}`} ref={setNodeRef} style={style}>
      <div className="task-card-top">
        <button className="drag-handle" title="Drag task" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
        <button className="task-open" onClick={() => onOpenTask(task)}>
          <span>{task.title}</span>
        </button>
        <span className={`priority ${task.priority}`}>{task.priority}</span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        {task.assignedTo ? (
          <span className="assignee-pill"><Avatar user={task.assignedTo} size="sm" /> {task.assignedTo.name}</span>
        ) : (
          <span className="chip">Unassigned</span>
        )}
        {task.deadline && (
          <span className={`chip ${overdue ? "overdue" : ""}`}>
            <CalendarDays size={14} /> {format(new Date(task.deadline), "MMM d")}
          </span>
        )}
      </div>

      <div className="task-footer">
        <span><MessageSquare size={14} /> {task.comments?.length || 0}</span>
        <span><Paperclip size={14} /> {task.attachments?.length || 0}</span>
        {!!task.activity?.length && <small>{task.activity[task.activity.length - 1].action}</small>}
      </div>
    </article>
  );
}
