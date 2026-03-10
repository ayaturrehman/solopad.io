import Navbar from "@/components/shared/Navbar";
import TopBar from "@/components/shared/TopBar";

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Navbar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 lg:px-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
