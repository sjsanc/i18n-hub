import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Plus, Tournament } from "tabler-icons-react";
import Sidebar from "../components/Sidebar";
import TranslationView from "../components/TranslationView";
import { useStore } from "../stores/useAppStore";
import { exportJson } from "../utils/export";

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const init = useStore((state) => state.init);
  const { currentEntry } = useStore((state) => state.entries);

  useEffect(() => {
    if (!session) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
      setLoaded(true);
      init();
    }
  }, [session]);

  if (!loaded && !showAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner thickness="5px" speed="0.4s" color="rose.500" size="xl" />
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="h-screen w-screen bg-zinc-900 flex items-center justify-center">
        <div className="border border-zinc-800 rounded p-3 text-white bg-white box-shadow">
          <h1 className="text-xl text-zinc-800 text-center">i18n-hub</h1>
          <Auth
            redirectTo="http://localhost:3000/"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabase}
            socialLayout="horizontal"
          />
        </div>
      </div>
    );
  }

  if (!showAuth && loaded) {
    return (
      <>
        <Head>
          <title>i18n-hub</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="fixed h-screen w-screen bg-white flex items-center">
          <Sidebar />
          <div className="flex flex-col h-full grow">
            <div className="flex items-center h-full overflow-hidden">
              <NamespacesList />
              <EntriesList />

              <section className="flex flex-col h-full grow gap-3 bg-slate-50 z-10">
                <NamespaceControlBar />
                {currentEntry && <TranslationView />}
              </section>
            </div>
            <Footer />
          </div>
          <SettingsModal />
        </main>
      </>
    );
  }
}

function SettingsModal() {
  const supabase = useSupabaseClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const session = useSession();

  const modal = useStore((state) => state.modal);
  const projectId = useStore((state) => state.projectId);
  const entries = useStore((state) => state.entries);
  const namespaces = useStore((state) => state.namespaces);

  useEffect(() => {
    if (modal.key === "settings") onOpen();
    else reset();
  }, [modal.key]);

  const reset = useCallback(() => {
    modal.set({ key: undefined, state: undefined });
    onClose();
  }, []);

  const [file, setFile] = useState<any>(undefined);
  // const [lang, setLang] = useState<string>("");

  const SUPPORTED_LANGS = ["en", "es"];

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const json = JSON.parse(e?.target.result);
          // setLang(json[".LANG"]);
          setFile(json);
        } catch (e) {
          console.log(e);
        }
      };
    }
  }, []);

  const handleUploadClick = useCallback(async () => {
    //  Clear DB
    // await supabase.from("entries").delete().eq("project_id", projectId);
    // await supabase.from("namespaces").delete().eq("project_id", projectId);
    // await supabase.from("supported_langs").delete().eq("project_id", projectId);

    let type: "merge" | "insert";
    const lang = file[".LANG"];
    const existingLangs = await supabase
      .from("supported_langs")
      .select("*")
      .eq("project_id", projectId);

    if (lang) {
      console.log("Detected lang: ", lang);
      await supabase
        .from("supported_langs")
        .insert({ lang, project_id: projectId });
    }

    if (existingLangs?.data?.length === 0) {
      type = "insert";
    } else type = "merge";

    console.log("Upload type:", type);

    if (type === "insert") {
      // Insert the new namespaces and return
      const _namespaces = await supabase
        .from("namespaces")
        .insert(
          Object.keys(file)
            .filter((n) => n !== ".LANG")
            .map((n) => ({
              name: n,
              project_id: projectId,
            }))
        )
        .select("*");

      // Insert the new entries and return
      const _entries = await supabase
        .from("entries")
        .insert(
          Object.entries(file).flatMap(([k, v]) => {
            const nsId = _namespaces?.data?.find((n) => n.name === k)?.id;

            if (nsId) {
              return Object.entries(v).flatMap((e) => ({
                key: e[0],
                translations: [{ lang, val: e[1] }],
                namespace_id: nsId,
                project_id: projectId,
              }));
            } else return [];
          })
        )
        .select("*");

      entries.setEntries(_entries.data);
      namespaces.setNamespaces(_namespaces.data);

      const activeNs = _namespaces.data?.[0];
      const activeEntry = _entries.data?.find(
        (e) => e.namespace_id === activeNs?.id
      );

      namespaces.select(activeNs ?? undefined);
      entries.select(activeEntry ?? undefined);
    }

    if (type === "merge") {
      const newTranslations = Object.entries(file).flatMap(([k, v]) => {
        return Object.entries(v).flatMap((e) => ({
          key: e[0],
          translations: { lang, val: e[1] },
        }));
      });

      const existingEntries = await supabase.from("entries").select("*");

      const entriesToUpsert = existingEntries.data.map((e) => ({
        ...e,
        translations: [
          ...e.translations,
          newTranslations.find((n) => n.key === e.key)?.translations,
        ],
      }));

      const entries = await supabase.from("entries").upsert(entriesToUpsert);
    }
  }, [file]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={reset}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody className="flex flex-col gap-2">
            <div>Signed in as {session?.user.email}</div>

            <div className="flex bg-slate-50 rounded p-2 flex-col gap-3">
              <h1 className="font-bold">Import JSON</h1>

              <input type="file" onChange={handleFileChange} />

              {file && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div>Detected Lang:</div>
                    {/* <div>{lang}</div> */}
                  </div>
                </div>
              )}

              <button
                className="bg-rose-500 text-white rounded px-3 py-2 text-sm font-bold focus:outline focus:outline-rose-200 hover:bg-rose-500/80 focus:bg-rose-500/70"
                onClick={handleUploadClick}
              >
                Upload
              </button>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

const NamespacesList = () => {
  const namespaces = useStore((state) => state.namespaces);

  return (
    <section className="w-36 border-r border-slate-200 h-full shadow-lg bg-white z-30 flex flex-col">
      <h1 className="font-bold text-center p-2 text-sm border-b border-slate-200 mb-2">
        Namespaces
      </h1>
      <div className="flex flex-col gap-1 px-2 grow overflow-y-scroll">
        {namespaces.allNamespaces.map((ns: any) => (
          <button
            className={`bg-slate-100 rounded px-2 py-1 text-sm ${
              ns?.id === namespaces.currentNamespace?.id
                ? "text-rose-500 font-bold bg-rose-50 hover:bg-rose-50"
                : "hover:bg-slate-200"
            }`}
            key={ns?.id}
            onClick={() => namespaces.select(ns)}
          >
            {ns.name}
          </button>
        ))}
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

  return (
    <section className="w-44 border-r border-slate-200 h-full shadow-lg bg-white flex flex-col z-20">
      <h1 className="font-bold text-center p-2 text-sm border-b border-slate-200 mb-2">
        Entries
      </h1>
      <div className="flex flex-col gap-1 px-2 grow overflow-y-scroll">
        {entries.allEntries
          .filter((e) => e.namespace_id === namespaces.currentNamespace?.id)
          .map((e) => (
            <button
              className={`bg-slate-100 rounded px-2 py-1 text-sm ${
                e.id === entries.currentEntry?.id
                  ? "text-rose-500 font-bold bg-rose-50 hover:bg-rose-50"
                  : "hover:bg-slate-200"
              }`}
              key={e.id}
              onClick={() => entries.select(e)}
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

const Footer = () => {
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
