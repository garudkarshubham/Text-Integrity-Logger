import { EntryForm } from '@/components/EntryForm'
import { EntryList } from '@/components/EntryList'
import { Suspense } from 'react'

// Force dynamic rendering for the home page (real-time entries)
export const dynamic = 'force-dynamic'

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Text Integrity Logger</h1>
                    <p className="text-gray-500 mt-2">Generic Hash Checker (SHA-256)</p>
                </header>

                <section>
                    <EntryForm />
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Saved Entries</h2>
                    <Suspense fallback={<div className="text-center py-12 text-gray-500 animate-pulse">Loading entries...</div>}>
                        <EntryList />
                    </Suspense>
                </section>
            </div>
        </main>
    )
}
