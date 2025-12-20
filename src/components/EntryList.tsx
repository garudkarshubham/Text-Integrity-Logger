

import { getEntries } from '@/data/entry'
import Link from 'next/link'
import { DeleteButton } from './DeleteButton'
import { CopyButton } from './CopyButton'
import { getCurrentUser } from '@/lib/auth'

export async function EntryList() {
    const user = await getCurrentUser()

    // If Admin, show ALL entries (undefined). If User, show only theirs (user.userId).
    const filterUserId = user?.role === 'ADMIN' ? undefined : user?.userId

    const entries = await getEntries(filterUserId)

    if (entries.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No entries yet. Create one above.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                    <tr>
                        <th className="p-4">Text Preview</th>
                        <th className="p-4">Hash</th>
                        <th className="p-4">Created At</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y">
                    {entries.map((entry) => (
                        <tr key={entry.id} id={`entry-row-${entry.id}`} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 max-w-xs font-mono text-gray-700 truncate" title={entry.text}>
                                <Link
                                    href={`/entries/${entry.id}`}
                                    className="group flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                                >
                                    <span className="truncate">{entry.text.substring(0, 80)}{entry.text.length > 80 && '...'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </td>
                            <td className="p-4 font-mono text-xs text-gray-500 max-w-[150px]" title="Hash">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded truncate block">{entry.hash}</span>
                                    <div className="shrink-0">
                                        <CopyButton text={entry.hash} />
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-500 whitespace-nowrap">
                                {entry.createdAt.toLocaleString()}
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
                            <td className="p-4 text-right">
                                <DeleteButton id={entry.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
