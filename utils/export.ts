import { set } from "lodash";
import { Entry, Namespace } from "../stores/useAppStore";

export const exportJson = (entries: Entry[], namespaces: Namespace[]) => {
  const output = {};
  entries.forEach((e) => {
    const ns = namespaces.find((ns) => ns.id === e.namespace_id)?.name;
    e.translations.forEach((tr) => {
      set(output, `${tr?.lang}.${ns}.${e?.key}`, tr?.val);
    });
  });

  return output;
};
