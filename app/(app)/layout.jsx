import AppShell from "@/components/shared/AppShell";

export const viewport = {
  width: 1280,
};

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
