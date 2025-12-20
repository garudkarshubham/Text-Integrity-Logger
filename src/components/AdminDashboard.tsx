'use client'

import { Entry } from '@/data/entry'
import { useState } from 'react'
import { tamperEntry, checkIntegrity, deleteEntry } from '@/actions/entry'
import { CopyButton } from './CopyButton'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'

export function AdminDashboard({ entries }: { entries: Entry[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
    const [checkingMap, setCheckingMap] = useState<Record<string, boolean>>({})
    const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({})
    const { success, error } = useToast()

    const handleStartTamper = (entry: Entry) => {
        setEditingId(entry.id)
        setEditText(entry.text)
    }

    const handleCancelTamper = () => {
        setEditingId(null)
        setEditText('')
    }

    const handleSaveTamper = async () => {
        if (!editingId) return

        setLoadingMap(prev => ({ ...prev, [editingId]: true }))
        try {
            // No key needed, cookie is checked by server
            const result = await tamperEntry(editingId, editText)
            if (result.error) {
                error(result.error)
            } else {
                success('Entry tampered successfully')
                setEditingId(null)
            }
        } catch (e) {
            error('Failed to tamper')
        } finally {
            setLoadingMap(prev => ({ ...prev, [editingId]: false }))
        }
    }

    const handleCheckIntegrity = async (id: string) => {
        setCheckingMap(prev => ({ ...prev, [id]: true }))
        try {
            const res = await checkIntegrity(id)
            if (res.result === 'Verified') {
                success('Verified: Integrity Match')
            } else if (res.result === 'Tampered') {
                error('Warning: Integrity Violation')
            }
        } catch (e) {
            error('Failed to check integrity')
        } finally {
            setCheckingMap(prev => ({ ...prev, [id]: false }))
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this entry? This cannot be undone.')) return

        // Optimistic UI: Hide immediately
        const row = document.getElementById(`entry-row-${id}`)
        if (row) row.style.display = 'none'

        setDeletingMap(prev => ({ ...prev, [id]: true }))
        try {
            await deleteEntry(id)
            success('Entry removed')
        } catch (e) {
            error('Failed to remove')
            // Revert if failed
            if (row) row.style.display = ''
        } finally {
            setDeletingMap(prev => ({ ...prev, [id]: false }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                    <p className="text-sm text-green-600">Authenticated (Secure)</p>
                </div>
                <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-gray-900 border px-3 py-1.5 rounded-md hover:bg-gray-50 bg-white"
                >
                    ← Back to Home
                </Link>
            </div>

            <div className="overflow-x-auto rounded-lg border shadow-sm bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                        <tr>
                            <th className="p-4">Text Content</th>
                            <th className="p-4">Current Hash</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Admin Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No entries found.
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} id={`entry-row-${entry.id}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 max-w-xs font-mono text-gray-700 truncate" title={entry.text}>
                                        {entry.text}
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-500 max-w-[150px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="bg-gray-100 px-2 py-1 rounded truncate block">{entry.hash}</span>
                                            <div className="shrink-0">
                                                <CopyButton text={entry.hash} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entry.integrityStatus === 'Verified'
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : entry.integrityStatus === 'Tampered'
                                                ? 'bg-red-100 text-red-800 border-red-200'
                                                : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}>
                                            {entry.integrityStatus || 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleCheckIntegrity(entry.id)}
                                            disabled={checkingMap[entry.id]}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {checkingMap[entry.id] ? ' Checking...' : 'Check Integrity'}
                                        </button>
                                        <button
                                            onClick={() => handleStartTamper(entry)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                        >
                                            Tamper
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            disabled={deletingMap[entry.id]}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            {deletingMap[entry.id] ? '...' : 'Remove'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Tamper Entry</h3>
                        <p className="text-sm text-gray-500">
                            Modifying this text without updating the hash will cause an integrity violation.
                        </p>

                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full h-32 p-3 border rounded-md font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={handleCancelTamper}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={loadingMap[editingId]}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTamper}
                                disabled={loadingMap[editingId]}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingMap[editingId] ? 'Tampering...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
