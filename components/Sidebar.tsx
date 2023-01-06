import { Settings } from "tabler-icons-react";
import { useStore } from "../stores/useAppStore";

export default function Sidebar() {
  const modal = useStore((state) => state.modal);

  return (
    <nav className="w-16 bg-zinc-800 h-full flex items-center flex-col justify-between shadow-md">
      <div className="text-rose-500 text-sm font-bold font-mono rounded flex items-center justify-center leading-none border border-2 border-rose-500 mt-3 aspect-square p-1 bg-zinc-900 shadow-lg outline outline-rose-600/25">
        i1
        <br />
        8N
      </div>
      <div
        className="text-zinc-500 hover:text-zinc-400 cursor-pointer p-3 mb-3 rounded transition aspect-square flex items-center justify-center hover:bg-zinc-700"
        onClick={() => modal.set({ key: "settings" })}
      >
        <Settings size={25} />
      </div>
    </nav>
  );
}
