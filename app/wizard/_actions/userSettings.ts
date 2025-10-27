"use server";

import { prisma } from "@/lib/prisma";
import { UserSettingsCurrencySchema } from "@/schema/userSettings";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function updateUserCurrency(currency: string) {
  const parsedBody = UserSettingsCurrencySchema.safeParse({ currency });
  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { currency },
    create: {
      userId: user.id,
      currency,
    },
  });

  return userSettings;
}
