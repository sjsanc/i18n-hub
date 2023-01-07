import create from "zustand";
import supabase from "../utils/supabase";

export interface Translation {
  val: string;
  lang: "en" | "es";
}

export interface Entry {
  id: string;
  project_id: string;
  namespace_id: string;
  key: string;
  translations: Translation[];
  context: string;
}

export interface Namespace {
  id: string;
  name: string;
}

interface Store {
  isSaving: boolean;
  projectId: string;
  init: () => void;
  entries: {
    allEntries: Entry[];
    currentEntry: Entry | undefined;
    select: (entry: Entry) => void;
    setEntries: (allEntries: Entry[]) => void;
    create: () => void;
    delete: (id: string) => void;
    update: (update: any) => void;
  };
  namespaces: {
    allNamespaces: Namespace[];
    currentNamespace: Namespace | undefined;
    select: (namespace: Namespace) => void;
    setNamespaces: (allNamespaces: Namespace[]) => void;
    create: () => void;
    delete: (id: string) => void;
    update: (id: string, update: any) => void;
  };
  modal: {
    key: string | undefined;
    state?: any | undefined;
    set: ({
      key,
      state,
    }: {
      key: string | undefined;
      state?: any | undefined;
    }) => void;
  };
}

export const useStore = create<Store>((set, get) => ({
  isSaving: false,
  importJson: (inputFile: any) => {
    inputFile?.current?.click();
  },
  projectId: "2c28b91f-42af-4fc7-8d3a-57774c0ab3be",
  init: async () => {
    const { projectId, entries, namespaces } = get();

    let _entries = await supabase
      .from("entries")
      .select("*")
      .eq("project_id", projectId);

    let _namespaces = await supabase
      .from("namespaces")
      .select("*")
      .eq("project_id", projectId);

    if (_entries.error || _namespaces.error) console.log("error");
    else {
      const activeNs = _namespaces.data?.[0];
      const activeEntry = _entries.data?.find(
        (e) => e.namespace_id === activeNs?.id
      );
      entries.setEntries(_entries.data);
      namespaces.setNamespaces(_namespaces.data);
      namespaces.select(activeNs ?? undefined);
      entries.select(activeEntry ?? undefined);
    }
  },

  modal: {
    key: undefined,
    state: undefined,
    set: ({ key, state }) => set({ modal: { ...get().modal, key, state } }),
  },

  entries: {
    allEntries: [],
    currentEntry: undefined,
    select: (currentEntry) => {
      set({ entries: { ...get().entries, currentEntry } });
    },
    setEntries: (allEntries) =>
      set({ entries: { ...get().entries, allEntries } }),
    create: () => {
      const {
        namespaces: { currentNamespace },
        projectId,
        entries,
      } = get();

      supabase
        .from("entries")
        .insert({
          key: "New Entry",
          namespace_id: currentNamespace?.id,
          project_id: projectId,
        })
        .select("*")
        .then((res) => {
          set({
            entries: {
              ...entries,
              allEntries: [...entries.allEntries, res.data?.[0]],
            },
          });
        });
    },
    delete: (id: string) => {
      const { entries } = get();

      supabase
        .from("entries")
        .delete()
        .eq("id", id)
        .then(() => {
          const newList = entries.allEntries.filter((e) => e.id !== id);
          set({
            entries: {
              ...entries,
              allEntries: newList,
              currentEntry: newList.at(-1),
            },
          });
        });
    },
    update: (update: any) => {
      const { entries } = get();
      set({ isSaving: true });
      supabase
        .from("entries")
        .update(update)
        .eq("id", entries.currentEntry?.id as string)
        .select("*")
        .then((res) => {
          set({
            entries: {
              ...entries,
              allEntries: entries.allEntries.map((e) =>
                e.id === entries.currentEntry?.id ? res.data?.[0] : e
              ),
            },
          });
          set({ isSaving: false });
        });
    },
  },

  // Namespaces
  namespaces: {
    currentNamespace: undefined,
    allNamespaces: [],
    select: (currentNamespace) => {
      const { namespaces, entries } = get();
      set({
        namespaces: { ...namespaces, currentNamespace },
        entries: {
          ...entries,
          currentEntry: entries.allEntries.find(
            (e) => e.namespace_id === currentNamespace.id
          ),
        },
      });
    },

    setNamespaces: (allNamespaces) =>
      set({ namespaces: { ...get().namespaces, allNamespaces } }),
    create: () => {
      const { namespaces, projectId } = get();

      supabase
        .from("namespaces")
        .insert({
          name: "unnamed",
          project_id: projectId,
        })
        .select("*")
        .then((res) => {
          console.log(res);
          set({
            namespaces: {
              ...namespaces,
              allNamespaces: [...namespaces.allNamespaces, res.data?.[0]],
            },
          });
        });
    },

    delete: async (id: string) => {
      console.log(id);
      const { namespaces } = get();

      await supabase
        .from("entries")
        .delete()
        .eq("namespace_id", id)
        .then(
          (r) => console.log(r),
          (e) => console.log(e)
        );

      await supabase.from("namespaces").delete().eq("id", id);

      const newList = namespaces.allNamespaces.filter((ns) => ns.id !== id);

      set({
        namespaces: {
          ...namespaces,
          allNamespaces: newList,
          currentNamespace: newList.at(-1),
        },
      });
    },
    update: (id: string, update: any) => {
      const { namespaces } = get();

      supabase
        .from("namespaces")
        .update(update)
        .eq("id", id)
        .select("*")
        .then((res) => {
          set({
            namespaces: {
              ...namespaces,
              allNamespaces: namespaces.allNamespaces.map((ns) =>
                ns.id === id ? res.data?.[0] : ns
              ),
            },
          });
        });
    },
  },
}));
