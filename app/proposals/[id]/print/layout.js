// Minimal layout — no navbar, no session provider needed.
// Root layout still wraps this, but we override body styles via the page's <style> tag.
export default function PrintLayout({ children }) {
  return children;
}
