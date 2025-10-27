import { z } from "zod";

export const CreateTransactionsSchema = z.object({
  type: z.enum(["income", "expense"]),
  date: z.date(),
  description: z.string().optional(),
  amount: z.number().positive(),
  category: z.string(),
});

export type CreateTransactionsSchemaType = z.infer<typeof CreateTransactionsSchema>;

