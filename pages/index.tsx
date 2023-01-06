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
import { useCallback, useEffect, useState } from "react";
import { Plus, Tournament } from "tabler-icons-react";
import Sidebar from "../components/Sidebar";
import TranslationView from "../components/TranslationView";
import { useStore } from "../stores/useAppStore";

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const init = useStore((state) => state.init);

  useEffect(() => {
    if (!session) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
      setLoaded(true);
      init();
      console.log("INIT");
    }

    console.log(session, loaded, showAuth);
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
      <main className="fixed h-screen w-screen bg-white flex items-center">
        <Sidebar />
        <div className="flex flex-col h-full grow">
          <div className="flex items-center h-full">
            <NamespacesList />
            <EntriesList />

            <section className="flex flex-col h-full grow gap-3 bg-slate-50 z-10">
              <NamespaceControlBar />
              <TranslationView />
            </section>
          </div>
          <Footer />
        </div>
        <SettingsModal />
      </main>
    );
  }
}

function SettingsModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const session = useSession();
  const modal = useStore((state) => state.modal);

  useEffect(() => {
    console.log(modal.key);
    if (modal.key === "settings") onOpen();
    else reset();
  }, [modal.key]);

  const reset = useCallback(() => {
    modal.set({ key: undefined, state: undefined });
    onClose();
  }, []);

  return (
    <>
      <Modal isOpen={isOpen} onClose={reset}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Signed in as {session?.user.email}</ModalBody>

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
      <h1 className="font-bold text-center p-2 text-sm">Namespaces</h1>
      <div className="flex flex-col gap-1 px-2 grow">
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
      <h1 className="font-bold text-center p-2 text-sm">Entries</h1>
      <div className="flex flex-col gap-1 px-2 grow">
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

  return (
    <div className="bg-white border-b w-full border-slate-200 h-12 shadow-sm flex items-center justify-end gap-2">
      <div className="flex items-center gap-2 text-sm">
        <h1 className="font-bold text-rose-500">
          {namespaces.currentNamespace?.name}
        </h1>
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
        <button className="bg-rose-500 text-white rounded px-3 py-2 text-sm font-bold focus:outline focus:outline-rose-200 hover:bg-rose-500/80 focus:bg-rose-500/70">
          Export JSON
        </button>
      </div>
    </footer>
  );
};
