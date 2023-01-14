import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BinaryTree, Dashboard, GridDots, Settings } from "tabler-icons-react";
import { useStore } from "../stores/useAppStore";

export default function Sidebar() {
  const modal = useStore((state) => state.modal);
  const router = useRouter();

  return (
    <nav className="w-16 bg-zinc-800 h-full flex items-center flex-col justify-between shadow-md">
      <div className="flex flex-col gap-2">
        <div className="text-rose-500 text-sm font-bold font-mono rounded flex items-center justify-center leading-none border border-2 border-rose-500 mt-3 aspect-square p-1 bg-zinc-900 shadow-lg outline outline-rose-600/25 px-2">
          i1
          <br />
          8N
        </div>

        <Tooltip
          hasArrow
          label="Dashboard"
          bg={"black"}
          color={"white"}
          fontSize={12}
        >
          <Link
            href="/"
            className={`text-zinc-300 hover:text-zinc-400 cursor-pointer p-3 rounded transition aspect-square flex items-center justify-center hover:bg-zinc-700 ${
              router.pathname === "/" && "bg-zinc-700"
            }`}
          >
            <Dashboard size={18} />
          </Link>
        </Tooltip>
        <Tooltip
          hasArrow
          label="Tree View"
          bg={"black"}
          color={"white"}
          fontSize={12}
        >
          <Link
            href="/tree"
            className={`text-zinc-300 hover:text-zinc-400 cursor-pointer p-3 rounded transition aspect-square flex items-center justify-center hover:bg-zinc-700`}
          >
            <BinaryTree size={18} />
          </Link>
        </Tooltip>
        <Tooltip
          hasArrow
          label="Grid View"
          bg={"black"}
          color={"white"}
          fontSize={12}
        >
          <Link
            href="/grid"
            className={`text-zinc-300 hover:text-zinc-400 cursor-pointer p-3 rounded transition aspect-square flex items-center justify-center hover:bg-zinc-700`}
          >
            <GridDots size={18} />
          </Link>
        </Tooltip>
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
