import React, { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import useDebounce from "../utils/useDebounce";

export default function TranslationInput({
  locale,
  value,
  rest,
  id,
}: {
  locale: string;
  value: any;
  rest: any;
  id: string;
}) {
  const [_value, setValue] = useState<string>(value);
  const debouncedValue = useDebounce<string>(_value, 500);

  useEffect(() => {
    if (debouncedValue !== value) {
      supabase
        .from("keys")
        .update({ translations: { ...rest, [locale]: _value } })
        .eq("id", id)
        .then((res) => console.log(res));
    }
  }, [debouncedValue]);

  return (
    <div className="p-2 bg-zinc-800 shadow-lg rounded w-full">
      <h2 className="font-bold text-slate-400 font-mono uppercase text-sm mb-1">
        {locale}
      </h2>
      <textarea
        className="border border-zinc-700 shadow-lg bg-zinc-800 p-2 rounded w-full "
        onChange={(e) => setValue(e.currentTarget.value)}
        value={_value}
      />
    </div>
  );
}
