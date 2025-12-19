'use server'

import { prisma } from '@/lib/db'
import { computeHash } from '@/lib/hash'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const EntrySchema = z.object({
    text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text exceeds 10,000 characters'),
})

export async function createEntry(formData: FormData) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000))
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
            },
        })

        revalidatePath('/')
        return { success: true, id: entry.id }
    } catch (error) {
        console.error('Create Error:', error)
        return { error: `Failed to create entry: ${(error as Error).message}` }
    }
}

export async function checkIntegrity(id: string) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        const entry = await prisma.entry.findUnique({ where: { id } })
        if (!entry) return { error: 'Entry not found' }

        // STRICT: Recompute hash from current DB text
        const currentHash = computeHash(entry.text)
        const storedHash = entry.hash

        const result = currentHash === storedHash ? 'Match' : 'Changed'

        await prisma.entry.update({
            where: { id },
            data: { integrityStatus: result }
        })

        revalidatePath('/')
        return { result }
    } catch (error) {
        return { error: 'Failed to check integrity' }
    }
}

export async function deleteEntry(id: string) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await prisma.entry.delete({ where: { id } })
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete' }
    }
}

export async function tamperEntry(id: string, newText: string, secretKey: string) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Security check
    const secret = process.env.TAMPER_SECRET_KEY
    if (!secret || secretKey !== secret) {
        return { error: 'Unauthorized: Invalid Admin Key' }
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
    } catch (e) {
        return { error: 'Failed to tamper' }
    }
}
