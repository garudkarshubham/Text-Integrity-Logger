'use server'

import { prisma } from '@/lib/db'
import { computeHash } from '@/lib/hash'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser, getCurrentUser } from '@/lib/auth'

const EntrySchema = z.object({
    text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text exceeds 10,000 characters'),
})

export async function createEntry(formData: FormData) {
    try {
        const user = await requireUser()
        const text = formData.get('text') as string
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
                integrityStatus: 'Unverified',
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
        const entry = await prisma.entry.findUnique({ where: { id } })
        if (!entry) return { error: 'Entry not found' }

        // Recompute hash from current DB text
        const currentHash = computeHash(entry.text)
        const storedHash = entry.hash

        const result = currentHash === storedHash ? 'Verified' : 'Tampered'

        await prisma.entry.update({
            where: { id },
            data: { integrityStatus: result }
        })

        revalidatePath('/')
        return { result }
    } catch (_error) {
        return { error: 'Failed to check integrity' }
    }
}

export async function deleteEntry(id: string) {
    try {
        await requireUser()
        // Ideally we should check if entry belongs to user or if user is admin
        // For now, simple auth check + assuming UI hides button if not owner

        await prisma.entry.delete({ where: { id } })
        revalidatePath('/')
        return { success: true }
    } catch (_error) {
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
    } catch (_e) {
        return { error: 'Failed to tamper' }
    }
}
