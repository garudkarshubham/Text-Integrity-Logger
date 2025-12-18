import { createHash } from 'crypto'

export function computeHash(text: string): string {
    // STRICT: Raw hashing of bytes. No normalization.
    return createHash('sha256').update(text).digest('hex')
}
