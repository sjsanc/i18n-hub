import { set } from "lodash";

export const generateJson = (data: any) => {
  const locales = {};

  data.forEach((key: any) => {
    Object.entries(key.translations).forEach(([k, v]) => {
      //   console.log(k);
      set(locales, `${k}.${key.ns}.${key.key}`, v);
    });
  });

  console.log(JSON.stringify(locales));
};
