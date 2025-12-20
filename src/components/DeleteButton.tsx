'use client'

import { deleteEntry } from '@/actions/entry'
import { useTransition } from 'react'
import { useToast } from '@/components/ui/Toast'

export function DeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()
    const { success, error } = useToast()

    const handleRemove = () => {
        if (!confirm('Are you sure you want to delete this entry?')) return

        // Optimistic UI: Hide row immediately
        const row = document.getElementById(`entry-row-${id}`)
        if (row) row.style.display = 'none'

        startTransition(async () => {
            const res = await deleteEntry(id)
            if (res.error) {
                error(res.error)
                // Revert on error
                if (row) row.style.display = ''
            } else {
                success('Entry deleted')
            }
        })
    }

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
            {isPending ? 'Deleting...' : 'Delete'}
        </button>
    )
}
