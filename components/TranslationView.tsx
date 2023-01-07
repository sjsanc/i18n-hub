import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Translation, useStore } from "../stores/useAppStore";

interface FormType {
  key: string;
  namespace: string;
  context: string;
  translations: Translation[];
}

export default function TranslationView() {
  const namespaces = useStore((state) => state.namespaces);
  const entries = useStore((state) => state.entries);

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
        console.log(entries.currentEntry);

        debouncedSave({
          key: value.key,
          context: value.context,
          namespace_id: value.namespace,
          translations: value.translations,
        });
      }
    });
    return () => sub.unsubscribe();
  }, [form.watch]);

  return entries.currentEntry ? (
    <>
      <div className="bg-white p-4 border border-slate-200 flex flex-col gap-2 rounded mx-3 z-30 ">
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
          <div className="flex items-center gap-2">
            <div className="text-rose-500 font-bold text-sm">ID:</div>
            <div className="bg-slate-50 text-slate-400 font-bold uppercase text-xs rounded px-1 ">
              {entries.currentEntry?.id}
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
      <div className="m-3 mt-auto flex flex-col gap-2">
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
    </>
  ) : null;
}
