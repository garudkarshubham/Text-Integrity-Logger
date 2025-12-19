'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface TamperModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (secretKey: string) => Promise<void>
    isTampering: boolean
}

export function TamperModal({ isOpen, onClose, onConfirm, isTampering }: TamperModalProps) {
    const [secretKey, setSecretKey] = useState('')

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await onConfirm(secretKey)
        setSecretKey('')
    }

    // Portal to document.body to ensure it sits on top of everything
    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-red-600 mb-2">⚠️ Security Warning</h3>
                <p className="text-gray-600 mb-6 text-sm">
                    This action will modify the entry text <strong>without</strong> updating the integrity hash.
                    This will intentionally create a mismatch to simulate a data breach or tampering event.
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Secret Key
                    </label>
                    <input
                        type="password"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="w-full p-2 border rounded-md mb-6 focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Enter secret key..."
                        required
                        autoFocus
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isTampering}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isTampering}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
                        >
                            {isTampering ? 'Tampering...' : 'Confirm Tamper'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}
