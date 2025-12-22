'use client'

import { checkIntegrity } from '@/actions/entry'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export function IntegrityCheckButton({ id }: { id: string }) {
    const router = useRouter()
    const [checking, setChecking] = useState(false)
    const { success, error } = useToast()

    async function handleCheck() {
        setChecking(true)
        const res = await checkIntegrity(id)
        setChecking(false)

        if (res.result) {
            router.refresh()
            if (res.result === 'Match') {
                success('Integrity Verified: Matches Original')
            } else {
                error('Integrity Warning: Content changed')
            }
        } else if (res.error) {
            error(res.error)
        }
    }

    return (
        <button
            onClick={handleCheck}
            disabled={checking}
            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            title="Verify integrity of this entry"
        >
            {checking ? 'Checking...' : 'Check Integrity'}
        </button>
    )
}
