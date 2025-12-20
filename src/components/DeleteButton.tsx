'use client'

import { deleteEntry } from '@/actions/entry'
import { useTransition } from 'react'
import { useToast } from '@/components/ui/Toast'

export function DeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()
    const { success, error } = useToast()

    const handleRemove = () => {
        if (!confirm('Are you sure you want to remove this entry?')) return

        startTransition(async () => {
            const res = await deleteEntry(id)
            if (res.error) {
                error(res.error)
            } else {
                success('Entry removed')
            }
        })
    }

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
            {isPending ? 'Removing...' : 'Remove'}
        </button>
    )
}
