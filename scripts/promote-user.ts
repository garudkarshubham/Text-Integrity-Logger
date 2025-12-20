
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Please provide an email address as an argument.')
        console.log('Usage: npx tsx scripts/promote-user.ts <email>')
        process.exit(1)
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        })
        console.log(`✅ Success! User '${user.email}' is now an ADMIN.`)
        console.log('You can now access the admin dashboard at /admin')
    } catch (_error) {
        console.error('❌ Failed to update user. Make sure the email exists.')
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
