
import { prisma } from '@/lib/db'

// Manual definition to bypass transient Prisma type generation issues in CI/Env
export interface Entry {
    id: string
    text: string
    hash: string
    textLength: number
    createdAt: Date
    integrityStatus?: string | null
    userId?: string | null
}

import { Prisma } from '@prisma/client'

// ... (existing imports/interfaces)

export async function getEntries(userId?: string): Promise<Entry[]> {
    try {
        const where: Prisma.EntryWhereInput = userId ? { userId } : {}
        return await prisma.entry.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        }) as Entry[]
    } catch (_error) {
        return []
    }
}

export async function getEntryById(id: string): Promise<Entry | null> {
    try {
        return await prisma.entry.findUnique({
            where: { id }
        })
    } catch (_error) {
        return null
    }
}
