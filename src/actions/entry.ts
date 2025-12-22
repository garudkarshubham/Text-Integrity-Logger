'use server'

import { prisma } from '@/lib/db'
import { computeHash } from '@/lib/hash'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser, getCurrentUser } from '@/lib/auth'

const EntrySchema = z.object({
    text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text exceeds 10,000 characters').refine(val => val.trim().length > 0, 'Text cannot be empty'),
})

export async function createEntry(formData: FormData) {
    try {
        const user = await requireUser()
        const text = formData.get('text')

        if (typeof text !== 'string') {
            return { error: 'Text cannot be empty' }
        }

        const validation = EntrySchema.safeParse({ text })

        if (!validation.success) {
            return { error: validation.error.flatten().fieldErrors.text?.[0] }
        }

        const { text: validatedText } = validation.data
        const hash = computeHash(validatedText)

        const entry = await prisma.entry.create({
            data: {
                text: validatedText,
                hash,
                textLength: validatedText.length,
                integrityStatus: 'Not Checked',
                userId: user.userId ?? undefined
            },
        })

        revalidatePath('/')
        return { success: true, id: entry.id }
    } catch (_error) {
        return { error: `Failed to create entry: ${(_error as Error).message}` }
    }
}

export async function checkIntegrity(id: string) {
    try {
        const user = await requireUser() // Ensure user is logged in first

        const entry = await prisma.entry.findUnique({ where: { id } })
        if (!entry) return { error: 'Entry not found' }

        // Security Check: Only Owner or Admin can check integrity
        if (user.role !== 'ADMIN' && entry.userId !== user.userId) {
            return { error: 'Unauthorized: You can only check your own entries' }
        }

        // Recompute hash from current DB text
        const currentHash = computeHash(entry.text)
        const storedHash = entry.hash

        const result = currentHash === storedHash ? 'Match' : 'Changed'

        await prisma.entry.update({
            where: { id },
            data: { integrityStatus: result }
        })

        revalidatePath('/')
        return { result }
    } catch {
        return { error: 'Failed to check integrity' }
    }
}

export async function deleteEntry(id: string) {
    try {
        const user = await requireUser()

        const whereClause = user.role === 'ADMIN'
            ? { id }
            : { id, userId: user.userId }

        // Attempt delete with strict condition
        // If entry doesn't exist OR doesn't belong to user, this will throw "Record to delete does not exist."
        try {
            await prisma.entry.delete({ where: whereClause })
        } catch (error) {
            // Prisma error code P2025 means "Record to delete does not exist."
            if ((error as { code?: string }).code === 'P2025') {
                return { error: 'Unauthorized: You can only delete your own entries' }
            }
            throw error // Re-throw other errors
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        if ((error as { message?: string }).message?.includes('Unauthorized')) {
            return { error: 'Unauthorized: You can only delete your own entries' }
        }
        return { error: 'Failed to delete' }
    }
}

export async function tamperEntry(id: string, newText: string) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        return { error: 'Unauthorized: Admins only' }
    }

    try {
        // Update text ONLY. Keep hash unchanged.
        await prisma.entry.update({
            where: { id },
            data: { text: newText }
            // Hash is NOT updated -> Integrity violation created.
        })
        revalidatePath(`/entries/${id}`)
        return { success: true }
    } catch {
        return { error: 'Failed to tamper' }
    }
}
