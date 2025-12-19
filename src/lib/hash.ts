import { createHash } from 'crypto'

export function computeHash(text: string): string {
    // Raw hashing of bytes. 
    return createHash('sha256').update(text).digest('hex')
}
