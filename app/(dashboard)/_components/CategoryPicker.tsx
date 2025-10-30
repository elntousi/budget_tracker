"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Category } from "@/lib/generated/prisma/client";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect } from "react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface Props {
  type: TransactionType;
  value: string;
  onChange: (v: string) => void;
}

function CategoryPicker({ type, value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!value) return;
      onChange(value); // Ενημέρωσε το parent component με την αρχική τιμή
    }, [value, onChange]);

  const { data = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  const selected = data.find((c) => c.name === value) ?? null;

  // Θα καλείται από το CreateCategoryDialog όταν δημιουργηθεί νέα κατηγορία
  const successCallback = useCallback((category: Category) => {
    onChange(category.name);
    setOpen(false);
  }, [onChange]);

  const { resolvedTheme } = useTheme();


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          {selected ? (
            <CategoryRow category={selected} />
          ) : isLoading ? (
            "Loading..."
          ) : (
            "Select a category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

     <PopoverContent
  className={cn(
    "w-[240px] p-0 border text-foreground backdrop-blur-md transition-colors duration-200",
    resolvedTheme === "dark"
      ? "bg-black/80 border-neutral-700 text-white"
      : "bg-white/80 border-neutral-300 text-black shadow-md"
  )}
>
  <Command onSubmit={(e) => e.preventDefault()}>
    <CommandInput placeholder="Search category..." />

    <CommandList>
      {data.length === 0 ? (
        <CommandEmpty>
          <p>No categories found.</p>
          <p className="text-xs text-muted-foreground">
            Tip: Create a new category.
          </p>
        </CommandEmpty>
      ) : (
        <CommandGroup>
          {data.map((category: Category) => (
            <CommandItem
              key={category.id}
              value={category.name}
              onSelect={(val) => {
                onChange(val);
                setOpen(false);
              }}
            >
              <CategoryRow category={category} />
              <Check
                className={cn(
                  "ml-auto w-4 h-4 text-green-400 transition-opacity",
                  value === category.name ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>

    <div className="flex justify-end p-2 border-t border-neutral-300 dark:border-neutral-700">
      <CreateCategoryDialog type={type} successCallback={successCallback} />
    </div>
  </Command>
</PopoverContent>

    </Popover>
  );
}

export default CategoryPicker;

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2">
      <span role="img">{category.icon}</span>
      <span>{category.name}</span>
    </div>
  );
}
