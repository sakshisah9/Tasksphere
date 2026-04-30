import { CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = {
  todo: "#64748b",
  "in-progress": "#2563eb",
  done: "#10b981"
};

export default function Analytics({ tasks }) {
  const data = ["todo", "in-progress", "done"].map((status) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length
  }));

  const completed = data.find((item) => item.name === "done")?.value || 0;
  const pending = tasks.length - completed;

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
      <Metric icon={<ListTodo />} label="Total tasks" value={tasks.length} />
      <Metric icon={<CheckCircle2 />} label="Completed" value={completed} tone="success" />
      <div className="panel flex h-32 items-center gap-4">
        <div className="h-28 w-28">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} innerRadius={30} outerRadius={48} dataKey="value" paddingAngle={3}>
                {data.map((entry) => <Cell key={entry.name} fill={colors[entry.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="flex items-center gap-2 text-slate-500"><Clock3 size={17} /> Pending</div>
          <p className="mt-1 text-3xl font-semibold">{pending}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <div className="panel flex h-32 items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
      </div>
      <div className={tone === "success" ? "metric-icon success" : "metric-icon"}>{icon}</div>
    </div>
  );
}
