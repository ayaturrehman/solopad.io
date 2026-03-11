// In-memory pub/sub for real-time comment delivery via SSE.
// Works because SQLite implies a single Node.js process.

const subscribers = new Map(); // projectId -> Set of handler functions

export function subscribe(projectId, handler) {
  if (!subscribers.has(projectId)) subscribers.set(projectId, new Set());
  subscribers.get(projectId).add(handler);
}

export function unsubscribe(projectId, handler) {
  subscribers.get(projectId)?.delete(handler);
  if (subscribers.get(projectId)?.size === 0) subscribers.delete(projectId);
}

export function publish(projectId, comment) {
  subscribers.get(projectId)?.forEach((handler) => handler(comment));
}
