"use client";

import * as React from "react";
import { useMediaQuery } from "../hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Currencies, Currency } from "@/lib/currencies";
import { useMutation, useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "./SkeletonWrapper";
import { UserSettings } from "@/lib/generated/prisma";
import { updateUserCurrency } from "@/app/wizard/_actions/userSettings";
import { toast } from "sonner";

export function CurrencyComboBox() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(null);

  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  React.useEffect(() => {
    if (!userSettings.data) return;

    const userCurrency = Currencies.find(
      (currency) => currency.value === userSettings.data.currency
    );

    if (userCurrency) setSelectedOption(userCurrency);
  }, [userSettings.data]);

  const mutation = useMutation({
    mutationFn: updateUserCurrency,
    onSuccess: (data: UserSettings) => {
      toast.success("Currency updated successfully! 🎉", { id: "update-currency" });

      setSelectedOption(
        Currencies.find((c) => c.value === data.currency) || null
      );
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to update currency. Please try again.", {
        id: "update-currency",
      });
    },
  });

  const selectOption = React.useCallback(
    (currency: Currency | null) => {
      if (!currency) {
        toast.error("Please select a valid currency.");
        return;
      }

      toast.loading("Updating currency...", {
        id: "update-currency",
      });

      mutation.mutate(currency.value);
    },
    [mutation]
  );

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-neutral-900 text-white border border-border hover:bg-neutral-800 transition-colors"
              disabled={mutation.isPending}
            >
              {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[220px] p-0 bg-neutral-900 border border-border rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95"
            align="start"
          >
            <div className="p-1">
              <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
            </div>
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-neutral-900 text-white border border-border hover:bg-neutral-800 transition-colors"
            disabled={mutation.isPending}
          >
            {selectedOption ? <>{selectedOption.label}</> : <>Set currency</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-neutral-900 text-white border-t border-border">
          <div className="mt-4 border-t border-border">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void;
  setSelectedOption: (status: Currency | null) => void;
}) {
  return (
    <Command className="bg-neutral-900 text-white">
      <CommandInput
        placeholder="Filter currency..."
        className="h-9 bg-neutral-900 text-white border-b border-border placeholder:text-neutral-400 focus:ring-0"
      />
      <CommandList className="max-h-[200px] overflow-y-auto">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((currency: Currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedOption(
                  Currencies.find((c) => c.value === value) || null
                );
                setOpen(false);
              }}
              className="cursor-pointer hover:bg-neutral-800 rounded-md px-2 py-1 transition-colors"
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
