import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEntry, checkIntegrity } from '@/actions/entry'
import { prisma } from '@/lib/db'

// Mock Prisma
vi.mock('@/lib/db', () => ({
    prisma: {
        entry: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}))

// Mock RevalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock Auth
vi.mock('@/lib/auth', () => ({
    requireUser: vi.fn().mockResolvedValue({ userId: 'test-user-id' }),
    getCurrentUser: vi.fn(),
}))

describe('Entry Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.TAMPER_SECRET_KEY = 'test-secret'
    })

    // Creating an entry rejects empty text
    it('should reject empty text creation', async () => {
        const formData = new FormData()
        formData.append('text', '') // Empty

        const result = await createEntry(formData)

        expect(result.error).toBeDefined()
        expect(result.error).toContain('empty')
        expect(prisma.entry.create).not.toHaveBeenCalled()
    })

    // Integrity check returns Checked when text matches hash
    it('should return Checked when integrity is intact', async () => {
        // Mock existing entry
        const mockEntry = {
            id: 'test-id',
            text: 'Hello World',
            hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', // SHA256 of "Hello World"
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(prisma.entry.findUnique).mockResolvedValue(mockEntry as unknown as any)

        const result = await checkIntegrity('test-id')

        expect(result.result).toBe('Checked')
    })

    // Integrity check returns Changed after Tamper
    it('should return Changed when text is tampered', async () => {
        // Mock entry where text differs from hash
        const mockEntry = {
            id: 'test-id',
            text: 'Hello World [TAMPERED]',
            hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', // Still hash of "Hello World"
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(prisma.entry.findUnique).mockResolvedValue(mockEntry as unknown as any)

        const result = await checkIntegrity('test-id')

        expect(result.result).toBe('Changed')
    })
})
