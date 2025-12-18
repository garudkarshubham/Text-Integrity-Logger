'use client'

import { deleteEntry } from '@/actions/entry'
import { useTransition } from 'react'

export function DeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={() => startTransition(async () => { await deleteEntry(id) })}
            disabled={isPending}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
            {isPending ? 'Deleting...' : 'Delete'}
        </button>
    )
}
