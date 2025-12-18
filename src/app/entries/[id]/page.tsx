import { getEntryById } from '@/data/entry'
import { IntegrityControls } from '@/components/IntegrityControls'
import { CopyButton } from '@/components/CopyButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EntryDetailPage({ params }: { params: { id: string } }) {
    // Await params in Next.js 15
    const { id } = await params
    const entry = await getEntryById(id)

    if (!entry) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="text-gray-500 hover:text-black">← Back to List</Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                        <div>
                            <h1 className="font-mono text-sm text-gray-500 uppercase tracking-widest">Entry ID</h1>
                            <p className="font-mono text-gray-900">{entry.id}</p>
                        </div>
                        <div className="text-right">
                            <h1 className="font-mono text-sm text-gray-500 uppercase tracking-widest">Created At</h1>
                            <p className="text-gray-900">{entry.createdAt.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">Stored Hash (SHA-256)</h2>
                            <div className="bg-gray-50 p-3 rounded border font-mono text-xs break-all text-gray-700 flex items-center justify-between">
                                <span>{entry.hash}</span>
                                <CopyButton text={entry.hash} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">Stored Text (Raw)</h2>
                            <div className="p-4 border rounded bg-white min-h-[100px] whitespace-pre-wrap font-mono text-sm text-gray-800">
                                {entry.text}
                            </div>
                        </div>

                        <IntegrityControls id={entry.id} currentText={entry.text} />
                    </div>
                </div>
            </div>
        </main>
    )
}
