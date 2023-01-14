import { Spinner } from "@chakra-ui/react";
import { useSession } from "@supabase/auth-helpers-react";
import { useStore } from "../stores/useAppStore";
import { exportJson } from "../utils/export";

export const Footer = () => {
  const session = useSession();
  const namespaces = useStore((state) => state.namespaces);
  const entries = useStore((state) => state.entries);
  const isSaving = useStore((state) => state.isSaving);

  return (
    <footer className="border-t h-14 border-slate-200 bg-white z-10 flex items-center justify-between px-2 z-50">
      <p className="text-zinc-400">Signed in as {session?.user.email}</p>
      <div className="flex items-center gap-2">
        {isSaving ? (
          <Spinner thickness="3px" speed="0.4s" color="rose.500" size="md" />
        ) : (
          <p className="text-rose-500 text-sm italic">up to date</p>
        )}
        <button className="bg-rose-500 text-white rounded px-3 py-2 text-sm font-bold focus:outline focus:outline-rose-200 hover:bg-rose-500/80 focus:bg-rose-500/70">
          Export Excel
        </button>
        <button
          className="bg-rose-500 text-white rounded px-3 py-2 text-sm font-bold focus:outline focus:outline-rose-200 hover:bg-rose-500/80 focus:bg-rose-500/70"
          onClick={() =>
            exportJson(entries.allEntries, namespaces.allNamespaces)
          }
        >
          Export JSON
        </button>
      </div>
    </footer>
  );
};
