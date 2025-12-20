'use client'

import { Entry } from '@/data/entry'
import { EntryForm } from './EntryForm'
import { EntryList } from './EntryList'
import { useOptimistic } from 'react'

export function EntryManager({ initialEntries, title = 'Saved Entries' }: { initialEntries: Entry[], title?: string }) {
    const [optimisticEntries, addOptimisticEntry] = useOptimistic(
        initialEntries,
        (state, newEntry: Entry) => [newEntry, ...state]
    )

    const handleAddOptimistic = (text: string) => {
        const tempEntry: Entry = {
            id: Math.random().toString(), // Temp ID
            text,
            hash: 'Computing...', // Placeholder
            textLength: text.length,
            createdAt: new Date(),
            integrityStatus: 'Not Checked',
            userId: 'current-user', // rough placeholder
        }
        addOptimisticEntry(tempEntry)
    }

    return (
        <div className="space-y-8">
            <section>
                <EntryForm onAddOptimistic={handleAddOptimistic} />
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                </div>
                <EntryList entries={optimisticEntries} />
            </section>
        </div>
    )
}
