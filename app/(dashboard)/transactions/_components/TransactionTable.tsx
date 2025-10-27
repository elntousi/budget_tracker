"use client";

import { DateToUTCDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { TransactionsHistoryResponse as GetTransactionHistoryResponseType } from "@/app/api/transactions-history/route";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";
import { Button } from "@/components/ui/button";

import{ download, generateCsv, mkConfig} from "export-to-csv"
import { DownloadIcon, MoreHorizontal, TrashIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteTransactionDialog from "./DeleteTransactionDialog";


interface Props {
  from: Date;
  to: Date;
}

const emptyData: any[] = [];
type TransactionHistoryRow = GetTransactionHistoryResponseType[0];

const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 capitalize">
        <span className="text-lg">{row.original.categoryIcon}</span>
        <span className="text-sm font-medium">{row.original.category}</span>
      </div>
    ),
  },

  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <div className="capitalize">{row.original.description || "-"}</div>
    ),
  },

  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formattedDate = date.toLocaleDateString("default", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return <div>{formattedDate}</div>;
    },
  },

  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div
        className={cn(
          "capitalize rounded-lg text-center px-3 py-1 font-medium w-[90px]",
          row.original.type === "income" &&
            "bg-emerald-400/10 text-emerald-500",
          row.original.type === "expense" && "bg-red-400/10 text-red-500"
        )}
      >
        {row.original.type}
      </div>
    ),
  },

  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const isIncome = row.original.type === "income";
      const amountFormatted = row.original.amount.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
      });

      return (
        <p
          className={cn(
            "text-md font-semibold rounded-lg p-2 text-center w-[100px]",
            isIncome ? "text-emerald-400" : "text-red-400"
          )}
        >
          {amountFormatted} €
        </p>
      );
    },
  },
  {
    id: "actions",
    enableHiding:false,
    cell: ({ row }) => (
      <RowAction transaction={row.original} />
    ),
  }
];

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
})

function TransactionTable({ from, to }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const history = useQuery({
    queryKey: ["transactions", "history", from, to],
    queryFn: () =>
      fetch(
        `/api/transactions-history?from=${DateToUTCDate(
          from
        )}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });

  const handleExportCSV = (data: any[]) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useReactTable({
    data: history.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const categoriesOptions = useMemo(() => {
    const categoriesMap = new Map();
    history.data?.forEach((transaction: TransactionHistoryRow) => {
      categoriesMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    });
    const uniqueCategories = new Set(categoriesMap.values());
    return Array.from(uniqueCategories);
  }, [history.data]);

  return (
    <div className="w-full mt-8 flex justify-center">
      <div className="w-full mt-5 px-10">
        <div className="flex gap-2 mb-3 pl-1">
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              title="Category"
              column={table.getColumn("category")}
              options={categoriesOptions}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              title="Type"
              column={table.getColumn("type")}
              options={[
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" },
              ]}
            />
          )}
        
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 lg:flex"
            onClick={()  => {
              const data = table.getFilteredRowModel().rows.map(row =>
              ({
                category: row.original.category,
                categoryIcons: row.original.categoryIcon,
                description: row.original.description,
                type: row.original.type,
                date: row.original.date,
                amount: row.original.amount,
                formattedAmount: row.original.formattedAmount,
              })
              );
              handleExportCSV(data);
            }}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div> 
        <SkeletonWrapper isLoading={history.isFetching}>
          <div className="rounded-md border border-border overflow-hidden bg-card shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-sm font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ✅ Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </SkeletonWrapper>
      </div>
    </div>
  );
}

export default TransactionTable;

function RowAction({transaction}: {transaction: TransactionHistoryRow}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
    <DeleteTransactionDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} transactionId={transaction.id} />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2" onSelect={
          () =>
          {setShowDeleteDialog ((prev) => !prev)}
        }>
          <TrashIcon className="h-4 w-4 text-muted-foreground " />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}