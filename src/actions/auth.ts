'use server'

import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword, createSession, clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = userSchema.safeParse({ email, password })
    if (!result.success) {
        return { error: 'Invalid email or password (min 6 chars)' }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return { error: 'Email already exists' }
    }

    const hashedPassword = hashPassword(password)
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'USER', // Default role
        },
    })

    await createSession(user)
    if (user.role === 'ADMIN') {
        redirect('/admin')
    }
    redirect('/')
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return { error: 'Invalid credentials' }
    }

    const match = verifyPassword(password, user.password)
    if (!match) {
        return { error: 'Invalid credentials' }
    }

    await createSession(user)
    if (user.role === 'ADMIN') {
        redirect('/admin')
    }
    redirect('/')
}

export async function logout() {
    await clearSession()
    redirect('/login')
}
