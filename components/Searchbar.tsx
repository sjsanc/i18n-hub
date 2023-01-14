import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { Search } from "tabler-icons-react";
import { useStore } from "../stores/useAppStore";

export default function Searchbar() {
  const { selectEntry } = useStore((state) => state.entries);
  const setSearch = useStore((state) => state.setSearch);
  const search = useStore((state) => state.search);

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Search size={20} className="text-slate-600" />
      </InputLeftElement>
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.currentTarget.value);
          selectEntry(undefined);
        }}
        focusBorderColor={"rose.500"}
        placeholder="Search for a translation..."
        borderColor="transparent"
      />
    </InputGroup>
  );
}
