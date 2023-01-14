import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Plus, Tournament } from "tabler-icons-react";
import Layout from "../components/Layout";
import Searchbar from "../components/Searchbar";
import TranslationView from "../components/TranslationView";
import { useStore } from "../stores/useAppStore";

export default function TreeView() {
  const { currentEntry, selectEntry } = useStore((state) => state.entries);
  const setSearch = useStore((state) => state.setSearch);
  const search = useStore((state) => state.search);

  return (
    <Layout>
      <div className="border-b border-slate-200 p-1">
        <Searchbar />
      </div>
      <div className="flex items-center h-full overflow-hidden">
        <NamespacesList />
        <EntriesList />

        <section className="flex flex-col h-full grow gap-3 bg-slate-50 z-10">
          <NamespaceControlBar />
          {currentEntry && <TranslationView />}
        </section>
      </div>
    </Layout>
  );
}

const NamespacesList = () => {
  const namespaces = useStore((state) => state.namespaces);
  const { allEntries } = useStore((state) => state.entries);
  const search = useStore((state) => state.search);

  return (
    <section className="w-36 border-r border-slate-200 h-full shadow-lg bg-white z-30 flex flex-col">
      <h1 className="font-bold text-center p-2 text-sm border-b border-slate-200 mb-2">
        Namespaces
      </h1>
      <div className="flex flex-col gap-1 px-2 grow overflow-y-scroll">
        {namespaces.allNamespaces
          .filter((ns) => ns.name.includes)
          .map((ns: any) => {
            const isActive = ns?.id === namespaces.currentNamespace?.id;
            return (
              <button
                key={ns?.id}
                onClick={() => namespaces.selectNamespace(ns)}
                className={`bg-slate-100 rounded flex items-center justify-between text-sm p-1 ${
                  isActive && "bg-rose-50 font-bold"
                }`}
              >
                {ns.name}
                <span className="text-rose-500 text-xs font-bold">
                  {
                    allEntries.filter(
                      (e) =>
                        e.namespace_id === ns?.id &&
                        (search === "" ? true : e.key.includes(search))
                    ).length
                  }
                </span>
              </button>
            );
          })}
        <button
          className="cursor-pointer hover:bg-slate-50 rounded py-1 focus:bg-slate-100 text-sm font-bold text-slate-400 flex items-center justify-center"
          onClick={namespaces.create}
        >
          <Plus size={16} />
        </button>
      </div>
    </section>
  );
};

const EntriesList = () => {
  const namespaces = useStore((state) => state.namespaces);
  const entries = useStore((state) => state.entries);
  const search = useStore((state) => state.search);

  return (
    <section className="w-44 border-r border-slate-200 h-full shadow-lg bg-white flex flex-col z-20">
      <h1 className="font-bold text-center p-2 text-sm border-b border-slate-200 mb-2">
        Entries
      </h1>
      <div className="flex flex-col gap-1 px-2 grow overflow-y-scroll">
        {entries.allEntries
          .filter(
            (e) =>
              e.namespace_id === namespaces.currentNamespace?.id &&
              (search !== "" ? e.key.includes(search) : true)
          )
          .map((e) => (
            <button
              className={`bg-slate-100 rounded px-2 py-1 text-sm ${
                e.id === entries.currentEntry?.id
                  ? "text-rose-500 font-bold bg-rose-50 hover:bg-rose-50"
                  : "hover:bg-slate-200"
              }`}
              key={e.id}
              onClick={() => entries.selectEntry(e)}
            >
              {e.key}
            </button>
          ))}
        <button
          className="cursor-pointer hover:bg-slate-50 rounded py-1 focus:bg-slate-100 text-sm font-bold text-slate-400 flex items-center justify-center"
          onClick={entries.create}
        >
          <Plus size={16} />
        </button>
      </div>
    </section>
  );
};

const NamespaceControlBar = () => {
  const namespaces = useStore((state) => state.namespaces);
  const { allEntries } = useStore((state) => state.entries);

  return (
    <div className="bg-white border-b w-full border-slate-200 h-12 shadow-sm flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 text-sm pl-3 font-bold">
        <div className="flex items-center gap-2">
          <span>Namespace:</span>
          <span className="text-rose-500">
            {namespaces.currentNamespace?.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Total Entries:</span>
          <span className="text-rose-500">
            {
              allEntries.filter(
                (e) => e.namespace_id === namespaces.currentNamespace?.id
              ).length
            }
          </span>
        </div>
      </div>

      <div className="h-full border-l border-slate-200 flex items-center justify-center">
        <Menu>
          <MenuButton
            as={"button"}
            className="h-full text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-rose-500 px-4"
          >
            <Tournament />
          </MenuButton>
          <MenuList zIndex={100}>
            <MenuItem
              className="text-sm hover:text-red-500 font-bold"
              onClick={async () =>
                namespaces.delete(namespaces.currentNamespace?.id as string)
              }
            >
              Delete Namespace
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </div>
  );
};
