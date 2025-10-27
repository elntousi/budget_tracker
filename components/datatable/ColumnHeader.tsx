"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn("text-sm font-semibold text-muted-foreground", className)}>
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center justify-between gap-2 rounded-md border border-border bg-neutral-900 text-sm font-semibold text-white",
              "hover:bg-neutral-800 transition-colors h-8 px-3"
            )}
          >
            <span>{title}</span>
            {sorted === "asc" ? (
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            ) : sorted === "desc" ? (
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-60" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-[130px] bg-neutral-900 border border-border rounded-md shadow-lg text-sm text-white p-1 z-50"
        >
          <DropdownMenuItem
            onClick={() => column.toggleSorting(false)}
            className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 rounded-md transition-colors"
          >
            <ArrowUp className="h-4 w-4" /> Asc
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => column.toggleSorting(true)}
            className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 rounded-md transition-colors"
          >
            <ArrowDown className="h-4 w-4" /> Desc
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => column.toggleVisibility(false)}
            className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:bg-neutral-800 rounded-md transition-colors"
          >
            <EyeOff className="h-4 w-4" /> Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
