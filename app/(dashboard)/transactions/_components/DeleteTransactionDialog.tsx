"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteTransaction } from "../_actions/DeleteTransaction";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void; // ✅ consistent naming
  transactionId: string;
}

function DeleteTransactionDialog({ open, onOpenChange, transactionId }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    // ✅ explicitly define parameter type for DeleteTransaction
    mutationFn: DeleteTransaction,
    onSuccess: async () => {
      toast.success("Transaction deleted successfully 🎉", {
        id: transactionId,
        description: "This transaction has been removed from your account.",
      });
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => {
      toast.error("Something went wrong", { id: transactionId });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            transaction.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting transaction...", {
                id: transactionId,
              });
              deleteMutation.mutate(transactionId); // ✅ matches type
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteTransactionDialog;
