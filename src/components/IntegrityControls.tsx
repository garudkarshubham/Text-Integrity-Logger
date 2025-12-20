'use client'

import { checkIntegrity, tamperEntry } from '@/actions/entry'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export function IntegrityControls({ id, currentText, isAdmin }: { id: string, currentText: string, isAdmin?: boolean }) {
    const [result, setResult] = useState<'Checked' | 'Changed' | null>(null)
    const [checking, setChecking] = useState(false)
    const router = useRouter()
    const { success, error } = useToast()

    // Tamper State
    const [isEditing, setIsEditing] = useState(false)
    const [tamperText, setTamperText] = useState(currentText)
    const [isTampering, setIsTampering] = useState(false)

    async function handleCheck() {
        setChecking(true)
        const res = await checkIntegrity(id)
        setChecking(false)
        if (res.result) {
            setResult(res.result as 'Checked' | 'Changed')
            if (res.result === 'Checked') {
                success('Integrity Checked: Hash matches content')
            } else {
                error('Integrity Warning: Content has been changed')
            }
        } else if (res.error) {
            error(res.error)
        }
    }

    async function handleSaveTamper() {
        setIsTampering(true)
        const res = await tamperEntry(id, tamperText)
        setIsTampering(false)
        if (res.error) {
            error(res.error)
        } else {
            success('Entry tampered successfully')
            setIsEditing(false)
            router.refresh() // Refresh to show new text
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

            {isAdmin && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700"
                >
                    Tamper
                </button>
            )}

            {result && (
                <span className={`px-4 py-2 rounded-full font-bold text-sm border ${result === 'Checked'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                    {result === 'Checked' ? 'Checked' : 'Changed'}
                </span>
            )}

            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Tamper Entry</h3>
                        <p className="text-sm text-gray-500">
                            Warning: Modifying this text without updating the hash will cause an integrity violation.
                        </p>

                        <textarea
                            value={tamperText}
                            onChange={(e) => setTamperText(e.target.value)}
                            className="w-full h-32 p-3 border rounded-md font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isTampering}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTamper}
                                disabled={isTampering}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                                {isTampering ? 'Saving...' : 'Save & Tamper'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
