import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useStore } from "../stores/useAppStore";

export default function SettingsModal() {
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
          const json = JSON.parse(e?.target?.result as string);
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
              return Object.entries(v as any).flatMap((e) => ({
                key: e[0],
                translations: [{ lang, val: e[1] }],
                namespace_id: nsId,
                project_id: projectId,
              }));
            } else return [];
          })
        )
        .select("*");

      if (_entries?.data && _namespaces?.data) {
        entries.setEntries(_entries.data);
        namespaces.setNamespaces(_namespaces.data);

        const activeNs = _namespaces.data?.[0];
        const activeEntry = _entries.data?.find(
          (e) => e.namespace_id === activeNs?.id
        );

        namespaces.selectNamespace(activeNs ?? undefined);
        entries.selectEntry(activeEntry ?? undefined);
      }
    }

    if (type === "merge") {
      const newTranslations = Object.entries(file).flatMap(([_, v]) => {
        return Object.entries(v as any).flatMap((e) => ({
          key: e[0],
          translations: { lang, val: e[1] },
        }));
      });

      const existingEntries = await supabase.from("entries").select("*");

      const entriesToUpsert = existingEntries?.data?.map((e) => ({
        ...e,
        translations: [
          ...e.translations,
          newTranslations.find((n) => n.key === e.key)?.translations,
        ],
      }));

      await supabase.from("entries").upsert(entriesToUpsert);
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
