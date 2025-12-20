
import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'node:crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex')
    const hashedPassword = scryptSync(password, salt, 64).toString('hex')
    return `${salt}:${hashedPassword}`
}

async function main() {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
        console.error('Please provide an email and new password.')
        console.log('Usage: npx tsx scripts/reset-password.ts <email> <newPassword>')
        process.exit(1)
    }

    if (newPassword.length < 6) {
        console.error('Password must be at least 6 characters long.')
        process.exit(1)
    }

    try {
        const hashedPassword = hashPassword(newPassword)
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        })
        console.log(`Success! Password for '${user.email}' has been updated.`)
    } catch {
        console.error('Failed to update password. Make sure the email exists.')
        // console.error(error)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
