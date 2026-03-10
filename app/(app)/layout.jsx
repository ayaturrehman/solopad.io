import Navbar from "@/components/shared/Navbar";
import TopBar from "@/components/shared/TopBar";

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Navbar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
