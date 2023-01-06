import { set } from "lodash";
import { Entry, Namespace } from "../stores/useAppStore";

export const exportJson = (entries: Entry[], namespaces: Namespace[]) => {
  const output = {};
  entries.forEach((e) =>
    Object.values(e.translations).forEach((tr) => {
      set(output, `${tr.lang}.${e.key}`, tr.val);
    })
  );

  navigator.clipboard.writeText(JSON.stringify(output));
};

// export const exportCsv = (entries: Entry[], namespaces: Namespace[]) => {
//   const keys = [];
// };
