import path from "path";
import { promises as fs } from "fs";

export default async function handler(req: any, res: any) {
  const localeDirectory = path.join(process.cwd(), "locales");
  const localeDirs = await fs.readdir(localeDirectory);

  let namespaces = new Set();
  let keys = new Set();
  let strings = new Map();

  let data = new Map();

  if (Array.isArray(localeDirs)) {
    for (const locale of localeDirs) {
      const translation = await fs.readFile(
        `${localeDirectory}/${locale}/translation.json`,
        "utf8"
      );

      const json = JSON.parse(translation);
      Object.entries(json).forEach(([nsKey, nsValue]) => {
        Object.entries(nsValue as any).forEach(([trKey, trValue]) => {
          if (!data.get(trKey))
            data.set(trKey, { namespace: nsKey, translations: {} });
          data.set(trKey, {
            ...data.get(trKey),
            translations: {
              ...data.get(trKey).translations,
              [locale]: trValue,
            },
          });
        });
      });
    }
  }

  //Return the content of the data file in json format
  res.status(200).json(Array.from(data));
}
