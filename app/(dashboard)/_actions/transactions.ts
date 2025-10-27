"use server";

import prisma from '@/lib/prisma';
import {CreateTransactionsSchema, CreateTransactionsSchemaType} from 'schema/transactions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function CreateTransaction(form: CreateTransactionsSchemaType) {
    const parsedBody = CreateTransactionsSchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message);
    }

    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    const { type, date, description, amount, category } = parsedBody.data;
    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: user.id,
            name: category,
            type,
        },
    });
    if (!categoryRow) {
        throw new Error('Category not found');
    }

    await prisma.$transaction([

        prisma.transaction.create({
            data: {
                userId: user.id,
                type,
                date,
                description: description || null,
                amount,
                categoryIcon: categoryRow.icon,
                category: categoryRow.name
            },
        }),

        // Ενημέρωση ή δημιουργία του monthHistory
        prisma.monthHistory.upsert({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: date.getUTCDate(),
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                },
            },
            create: {
                userId: user.id,
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                income: type === 'income' ? amount : 0,
                expense: type === 'expense' ? amount : 0,
            },
            update: {
                income: {
                    increment: type === 'income' ? amount : 0,
                },
                expense: {
                    increment: type === 'expense' ? amount : 0,  
                },
            },
        }),
        // Ενημέρωση ή δημιουργία του yearHistory
        prisma.yearHistory.upsert({
            where: {
                month_year_userId: {    
                    userId: user.id,
                    month: date.getUTCMonth(),
                    year: date.getUTCFullYear(),
                },
            },
            create: {   
                userId: user.id,
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                income: type === 'income' ? amount : 0,
                expense: type === 'expense' ? amount : 0,
            },  
            update: {
                income: {
                    increment: type === 'income' ? amount : 0,
                    
                
                }, 
                  expense: {     
                    increment: type === 'expense' ? amount : 0,     
                },
            },
        }),                  
    ])
}