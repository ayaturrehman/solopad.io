export function parseSubtasks(value) {
  if (!value) return [];

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((subtask, index) => ({
        id: subtask.id || `subtask-${index}`,
        title: typeof subtask.title === "string" ? subtask.title : "",
        done: Boolean(subtask.done),
      }))
      .filter((subtask) => subtask.title.trim());
  } catch {
    return [];
  }
}

export function serializeSubtasks(subtasks) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) return null;

  return JSON.stringify(
    subtasks
      .map((subtask, index) => ({
        id: subtask.id || `subtask-${index}`,
        title: typeof subtask.title === "string" ? subtask.title.trim() : "",
        done: Boolean(subtask.done),
      }))
      .filter((subtask) => subtask.title)
  );
}

export function normalizeTask(task) {
  return {
    ...task,
    subtasks: parseSubtasks(task.subtasks),
  };
}
