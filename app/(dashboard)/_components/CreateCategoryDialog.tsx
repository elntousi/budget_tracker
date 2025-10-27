'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import React, { useCallback , useState } from 'react';
import { useForm } from 'react-hook-form';
import EmojiPicker from '@/components/EmojiPicker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_actions/categories';
import { Category } from '@/prisma/lib/generated/prisma/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface Props {
  type: TransactionType;
  successCallback?: (category: Category) => void;
  trigger?: React.ReactNode;
}

function CreateCategoryDialog({ type, successCallback, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
  name: "",
  icon: "",
  type,
},

  });

 const queryClient = useQueryClient();


const { mutate, isPending } = useMutation({
  mutationFn: CreateCategory,
  onSuccess: async (data: Category) => {
    // ✅ 1. Κλείσε το loading toast
    toast.dismiss("create-category");

    // ✅ 2. Εμφάνισε μήνυμα επιτυχίας
    toast.success(`Category ${data.name} created successfully 🎉`, {
      id: "create-category",
    });

    // ✅ 3. Καθάρισε το form
    form.reset({
      name: "",
      icon: "",
      type,
    });

    // ✅ 4. Ενημέρωσε το CategoryPicker
    successCallback?.(data);

    // ✅ 5. Ανανεώσε τις κατηγορίες
    await queryClient.invalidateQueries({
      queryKey: ["categories"],
    });

    // ✅ 6. Κλείσε οριστικά το dialog
    setOpen(false);
  },
  onError: () => {
    toast.dismiss("create-category");
    toast.error("Something went wrong", {
      id: "create-category",
    });
  },
});

const onSubmit = useCallback(
  (values: CreateCategorySchemaType) => {
    toast.loading("Creating category...", {
      id: "create-category",
    });
    mutate(values);
  },
  [mutate]
);

const { theme, resolvedTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
       { trigger ? (
        trigger
       ) : (
        <Button
          variant="ghost"
          className="flex items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
        >
          <PlusSquare className="mr-2 h-4 w-4" />
          Create new
        </Button>
       )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new category
            <span
              className={cn('m-1', type === 'income' ? 'text-emerald-500' : 'text-red-500')}
            >
              {type}
            </span>
          </DialogTitle>
          <DialogDescription>Please enter the details for the new category.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category" {...field} />
                  </FormControl>
                  <FormDescription>This is how your category will appear in the app.</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => {
                const icon = form.watch('icon');
                return (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-[100px] w-full">
                            {icon ? (
                              <div className="flex flex-col items-center gap-2 w-full">
                                <span className="text-5xl">{icon}</span>
                                <p className="text-xs text-muted-foreground">Click to change</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 w-full">
                                <CircleOff className="h-[48px] w-[48px]" />
                                <p className="text-xs text-muted-foreground">Click to select</p>
                              </div>
                            )}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-[320px] p-0">
                          <EmojiPicker
                          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                         className="h-[380px] w-full"
                         onSelect={(unicode: string) => {
                         field.onChange(unicode);
                         setPickerOpen(false);
                         }}
                         />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>This is how your category will appear in the app.</FormDescription>
                  </FormItem>
                );
              }}
            />
          </form>
        </Form>
        <DialogFooter>
           <DialogClose asChild>
                <Button 
                type="button"
                variant="secondary"
                onClick={() => {
                    form.reset();
                }}>
                    Cancel
                    </Button>
                    </DialogClose>
            <Button onClick={form.handleSubmit(onSubmit)} disabled=
            {isPending} >
                {!isPending && "Create"}
                {isPending && <Loader2 className='animatespin' />}
            </Button>
        </DialogFooter>{""}
        </DialogContent>
    </Dialog>
  );
}

export default CreateCategoryDialog;
