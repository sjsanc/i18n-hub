import React, { useMemo } from "react";
import { useTable } from "react-table";
import { TableVirtuoso } from "react-virtuoso";
import Layout from "../components/Layout";
import Searchbar from "../components/Searchbar";
import { useStore } from "../stores/useAppStore";

export default function GridView() {
  const { allEntries } = useStore((state) => state.entries);
  const { allNamespaces } = useStore((state) => state.namespaces);

  const data = useMemo<any>(
    () =>
      allEntries.map((e) => ({
        col1: e.key,
        col2: allNamespaces.find((ns) => ns.id === e.namespace_id)?.name,
        col3: e.translations[0]?.val,
        col4: e.translations[1]?.val,
        col5: e.context,
      })),
    [allEntries, allNamespaces]
  );

  const columns = useMemo(
    () => [
      { Header: "Key", accessor: "col1" },
      { Header: "Namespace", accessor: "col2" },
      { Header: "English", accessor: "col3" },
      { Header: "Spanish", accessor: "col4" },
      { Header: "Context", accessor: "col5" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  return (
    <Layout>
      <div className="grow">
        <div className="border-b border-slate-200 p-1">
          <Searchbar />
        </div>
        <TableVirtuoso
          data={allEntries}
          totalCount={allEntries.length}
          components={{
            Table: ({ style, ...props }) => (
              <table
                {...getTableProps()}
                {...props}
                style={{
                  ...style,

                  tableLayout: "fixed",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
                className="w-full"
              />
            ),
            TableBody: React.forwardRef(function TableBody(
              { style, ...props },
              ref
            ) {
              return <tbody {...getTableBodyProps()} {...props} ref={ref} />;
            }),
            TableRow: (props) => {
              const index = props["data-index"];
              const row = rows[index];
              return (
                <tr
                  {...props}
                  {...row.getRowProps()}
                  className="divide-x divide-slate-200 border-b border-slate-200"
                />
              );
            },
          }}
          fixedHeaderContent={() => {
            return headerGroups.map((headerGroup, i) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                key={i}
                className="bg-white w-full"
              >
                {headerGroup.headers.map((column, i) => (
                  <th
                    {...column.getHeaderProps()}
                    key={i}
                    style={{
                      width: i < 2 ? 200 : i === 4 ? "auto" : 500,
                    }}
                    className="border-b-2 border-b-rose-500 border-r border-r-slate-200 px-2"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ));
          }}
          itemContent={(index, user) => {
            const row = rows[index];
            prepareRow(row);
            return row.cells.map((cell, i) => {
              return (
                <td
                  {...cell.getCellProps()}
                  key={i}
                  className="px-2 border-b border-b-slate-200"
                >
                  {cell.render("Cell")}
                </td>
              );
            });
          }}
        />
      </div>
    </Layout>
  );
}
