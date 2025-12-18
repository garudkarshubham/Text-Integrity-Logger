'use client'

import { checkIntegrity, tamperEntry } from '@/actions/entry'
import { useState } from 'react'

export function IntegrityControls({ id, currentText }: { id: string, currentText: string }) {
    const [result, setResult] = useState<'Match' | 'Changed' | null>(null)
    const [checking, setChecking] = useState(false)
    const [tampering, setTampering] = useState(false)

    async function handleCheck() {
        setChecking(true)
        const res = await checkIntegrity(id)
        setChecking(false)
        if (res.result) {
            setResult(res.result as 'Match' | 'Changed')
        }
    }

    async function handleTamper() {
        if (!confirm('WARNING: This will modify the text WITHOUT updating the hash. This intentionally breaks integrity. Continue?')) return

        const secretKey = prompt('Enter Admin Secret Key to proceed:')
        if (!secretKey) return

        setTampering(true)
        // Tamper by appending a visible marker or changing a char
        const tamperedText = currentText + ' [TAMPERED]'
        const res = await tamperEntry(id, tamperedText, secretKey)
        setTampering(false)

        if (res.error) {
            alert(res.error)
        } else {
            setResult(null) // Reset result so user has to check again
            alert('Tamper simulated. Text updated. Hash unchanged.')
        }
    }

    return (
        <div className="flex items-center gap-4 mt-6 border-t pt-6">
            <button
                onClick={handleCheck}
                disabled={checking}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {checking ? 'Checking...' : 'Integrity Check'}
            </button>

            {result && (
                <span className={`px-4 py-2 rounded-full font-bold text-sm border ${result === 'Match'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                    {result === 'Match' ? 'Match' : 'Changed'}
                </span>
            )}

            <div className="flex-grow"></div>

            <button
                onClick={handleTamper}
                disabled={tampering}
                className="px-4 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium"
            >
                {tampering ? 'Tampering...' : 'Tamper'}
            </button>
        </div>
    )
}
