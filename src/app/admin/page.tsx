import { EntryManager } from '@/components/EntryManager'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from '@/actions/auth'
import { getEntries } from '@/data/entry'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    if (user.role !== 'ADMIN') {
        redirect('/')
    }

    const entries = await getEntries() // Admin sees all

    return (
        <main className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Text Integrity Logger</h1>
                        <p className="text-gray-500 mt-2">Generic Hash Checker (SHA-256) - Admin Console</p>
                    </div>
                    {user && (
                        <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-sm text-gray-600 font-medium px-2 py-1 bg-gray-100 rounded">
                                {user.email} (Admin)
                            </span>
                            <form action={logout}>
                                <button type="submit" className="text-sm text-red-600 hover:text-red-800 hover:underline">
                                    Sign out
                                </button>
                            </form>
                        </div>
                    )}
                </header>

                <Suspense fallback={<div className="text-center py-12 text-gray-500 animate-pulse">Loading entries...</div>}>
                    <EntryManager initialEntries={entries} title="All Global Entries" />
                </Suspense>
            </div>
        </main>
    )
}
