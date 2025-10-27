import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Overview from "./_components/Overview";
import History from "./_components/History";

async function page() {
  // 🔹 Παίρνουμε τον τρέχοντα χρήστη
  const user = await currentUser();

  // Αν δεν υπάρχει χρήστης -> redirect στη σελίδα login
  if (!user) {
    redirect("/sign-in");
  }

  // 🔹 Παίρνουμε τα settings του χρήστη (currency κλπ)
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  // Αν δεν έχει ρυθμίσεις -> redirect στο wizard setup
  if (!userSettings) {
    redirect("/wizard");
  }

  // 🔹 Αν υπάρχει χρήστης και έχει ρυθμίσεις
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
  <div className="px-6 md:px-12 lg:px-20 flex flex-wrap items-center justify-between gap-6 py-8">
    <p className="text-3xl font-bold">
      Hello, {user.firstName}! 👋
    </p>
          <div className="flex items-center gap-3">
             <CreateTransactionDialog
            trigger={
             <Button
          variant={"outline"}
          className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
        >
                    New income 💰
        </Button>
      }
      type="income"
    />
       <CreateTransactionDialog
         trigger={
             <Button
                  variant={"outline"}
                  className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
    >
                  Expense 😵
              </Button>
  }
      type="expense"
/>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-10">
  <p className="text-muted-foreground">
    Your preferred currency: {userSettings.currency}
  </p>
</div>

<Overview userSettings={userSettings} />
<div className="px-6 md:px-12 lg:px-20 py-10 space-y-10">
  <History userSettings={userSettings} />
</div>

    </div>
  );
}

export default page;
