// Shared task utilities and constants used by TasksClient and ProjectTasksSection

export const PRIORITY_DOT = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-400",
};

export const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export const STATUS_PILL = {
  todo: "bg-zinc-100 text-zinc-500",
  in_progress: "bg-blue-50 text-blue-700",
  done: "bg-green-50 text-green-700",
};

export function makeSubtask(title = "") {
  return {
    id: `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    done: false,
  };
}

export function cleanSubtasks(subtasks) {
  return (subtasks || []).filter((s) => s.title.trim());
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate) < new Date();
}
