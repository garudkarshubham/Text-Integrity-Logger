'use client'

import { createEntry } from '@/actions/entry'
import { useState } from 'react'

export function EntryForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const res = await createEntry(formData)
        setLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            const form = document.getElementById('entry-form') as HTMLFormElement
            form.reset()
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Entry</h2>
            <form id="entry-form" action={handleSubmit} className="flex flex-col gap-4">
                <textarea
                    name="text"
                    placeholder="Enter text here to generate an integrity hash..."
                    className="w-full p-4 border rounded-md min-h-[120px] focus:ring-2 focus:ring-black focus:outline-none text-gray-800 font-mono text-sm"
                    required
                />
                {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="self-end px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
                >
                    {loading ? 'Saving...' : 'Save Entry'}
                </button>
            </form>
        </div>
    )
}
