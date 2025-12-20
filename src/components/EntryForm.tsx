'use client'

import { createEntry } from '@/actions/entry'
import { SubmitButton } from './SubmitButton'
import { useRef } from 'react'
import { useToast } from '@/components/ui/Toast'

export function EntryForm({ onAddOptimistic }: { onAddOptimistic: (text: string) => void }) {
    const ref = useRef<HTMLFormElement>(null)
    const { success, error } = useToast()

    async function clientAction(formData: FormData) {
        const text = formData.get('text') as string
        if (text) {
            onAddOptimistic(text)
            ref.current?.reset()
        }

        const result = await createEntry(formData)
        if (result.error) {
            error(result.error)
            // Ideally revert optimistic update here if complex, but valid for now
        } else {
            success('Entry created successfully')
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">New Entry</h2>
            <form ref={ref} action={clientAction} className="flex flex-col gap-4">
                <textarea
                    name="text"
                    placeholder="Enter text here to generate an integrity hash..."
                    className="w-full p-4 border rounded-md min-h-[120px] focus:ring-2 focus:ring-black focus:outline-none text-gray-800 font-mono text-sm"
                    required
                />
                <SubmitButton />
            </form>
        </div>
    )
}
