import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Translation, useStore } from "../stores/useAppStore";

interface FormType {
  key: string;
  namespace: string;
  context: string;
  translations: Translation[];
}

export default function TranslationView() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const namespaces = useStore((state) => state.namespaces);
  const entries = useStore((state) => state.entries);

  const [lastEditedBy, setLastEditBy] = useState<string>();

  const form = useForm<FormType>({
    defaultValues: {
      key: "",
      namespace: undefined,
      context: "",
      translations: [],
    },
  });

  const translations = useFieldArray({
    control: form.control,
    name: "translations",
  });

  useEffect(() => {
    form.reset({
      key: entries.currentEntry?.key,
      namespace: namespaces.currentNamespace?.id as string,
      context: entries.currentEntry?.context,
      translations: entries.currentEntry?.translations,
    });
  }, [entries.currentEntry]);

  const debouncedSave = useCallback(debounce(entries.update, 1000), []);

  useEffect(() => {
    const sub = form.watch((value, { name, type }) => {
      if (type === "change") {
        debouncedSave({
          key: value.key,
          context: value.context,
          namespace_id: value.namespace,
          translations: value.translations,
          last_edit_by: session?.user.id,
        });
      }
    });
    return () => sub.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("email")
      .eq("id", session?.user.id)
      .then((r) => setLastEditBy(r?.data?.[0]?.email));
  }, []);

  return entries.currentEntry ? (
    <>
      <div className="mx-3 flex flex-col gap-2">
        {translations.fields.map((tr, i) => (
          <div
            className="bg-white border border-slate-200 rounded p-3"
            key={tr.id}
          >
            <h2 className="text-xs font-bold uppercase text-slate-500 mb-2">
              {tr.lang}
            </h2>
            <Textarea
              borderColor={"slate.200"}
              bg={"white"}
              focusBorderColor={"rose.500"}
              {...form.register(`translations.${i}.val`)}
            />
          </div>
        ))}
      </div>
      <div className="bg-white p-4 border border-slate-200 flex flex-col gap-2 rounded m-3 z-30 mt-auto ">
        <div className="grid grid-cols-2 gap-2">
          <FormControl>
            <FormLabel>Key</FormLabel>
            <Input
              {...form.register("key")}
              borderColor={"slate.200"}
              bg={"white"}
              focusBorderColor={"rose.500"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Namespace</FormLabel>
            <Select
              {...form.register("namespace")}
              borderColor={"slate.200"}
              bg={"white"}
              focusBorderColor={"rose.500"}
            >
              {namespaces.allNamespaces.map((ns) => (
                <option value={ns.id} key={ns.id}>
                  {ns.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </div>
        <FormControl>
          <FormLabel>Context</FormLabel>
          <Textarea
            {...form.register("context")}
            w={"100%"}
            borderColor={"slate.200"}
            focusBorderColor={"rose.500"}
          />
        </FormControl>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm">
              <div className="text-rose-500 font-bold text-sm">ID:</div>
              <div>{entries.currentEntry?.id}</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="text-rose-500 font-bold text-sm">
                Last Edited By:
              </div>
              <div>{lastEditedBy || "Unknown"}</div>
            </div>
          </div>
          <button
            className="text-rose-500 text-sm font-bold hover:text-rose-400"
            onClick={() => entries.delete(entries.currentEntry?.id as string)}
          >
            Delete Key
          </button>
        </div>
      </div>
    </>
  ) : null;
}
