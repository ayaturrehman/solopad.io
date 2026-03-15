import path from "path";

export function safePath(projectId, filename) {
  const clean = path.basename(filename);
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const full = path.resolve(uploadsRoot, projectId, clean);

  if (!full.startsWith(uploadsRoot + path.sep) && full !== uploadsRoot) {
    throw new Error("Invalid file path");
  }
  return { clean, full };
}
