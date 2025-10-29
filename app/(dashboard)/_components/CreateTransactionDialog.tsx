"use client";

import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateTransaction } from "../_actions/transactions";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateTransactionsSchema, CreateTransactionsSchemaType } from "@/schema/transactions";
import React, { ReactNode, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoryPicker from "./CategoryPicker";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateToUTCDate } from "@/lib/helpers";

type CreateTxFormInput = z.input<typeof CreateTransactionsSchema>;
type CreateTxFormOutput = z.output<typeof CreateTransactionsSchema>;

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

function CreateTransactionDialog({ trigger, type }: Props) {
  const form = useForm<CreateTxFormInput, CreateTxFormOutput>({
    resolver: zodResolver(CreateTransactionsSchema),
    defaultValues: {
      type,
      date: new Date(),
      description: "",
      amount: 0,
      category: "",
    },
  });

  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: async () => {
      toast.dismiss("create-transaction");
      toast.success("✅ Transaction created successfully!", {
        id: "create-transaction",
      });

      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      form.reset({
        type,
        date: new Date(),
        description: "",
        amount: 0,
        category: undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["overview"] });

      setOpen((prev) => !prev);
    },

    onError: () => {
      toast.dismiss("create-transaction");
      toast.error("❌ Something went wrong while saving.", {
        id: "create-transaction",
      });
    },
  });
const onSubmit = useCallback(
    (values: CreateTransactionsSchemaType) => {
      toast.loading("Creating transaction...", { id: "create-transaction" });
      mutate({
        ... values,
      date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );

  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[480px] border backdrop-blur-md transition-colors duration-200",
          resolvedTheme === "dark"
            ? "bg-black/80 border-neutral-700 text-white"
            : "bg-white/80 border-neutral-300 text-black shadow-md"
        )}
      >
        <DialogHeader>
          <DialogTitle>
            Create a new{" "}
            <span
              className={cn(
                "m-1 font-semibold",
                type === "income" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type}
            </span>{" "}
            transaction
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Salary or Rent" {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={
                        Number.isNaN(Number(field.value))
                          ? 0
                          : Number(field.value)
                      }
                      onChange={(e) =>
                        field.onChange(e.currentTarget.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction amount (required)
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Category Preview */}
            {form.watch("category") && (
              <p
                className={cn(
                  "text-sm mt-2 italic",
                  resolvedTheme === "dark"
                    ? "text-neutral-300"
                    : "text-neutral-600"
                )}
              >
                Transaction:{" "}
                <span className="font-medium text-foreground">
                  {form.watch("category")}
                </span>
              </p>
            )}

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryPicker
                      type={type}
                      value={field.value}
                      onChange={handleCategoryChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Select a category for this transaction
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value as Date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value as Date | undefined}
                        onSelect={(value) => {
                          if (!value) return;
                          console.log("@@CALENDAR", value)
                          field.onChange(value);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select a date for this transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </DialogClose>

          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && "Create"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;
