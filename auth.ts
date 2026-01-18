import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { z } from 'zod'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/signin',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) return null

        const { email, password } = parsedCredentials.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const passwordMatch = await compare(password, user.password)

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        
        try {
          // Fetch organization data through OrganizationMember
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              OrganizationMember: {
                include: {
                  Organization: {
                    select: {
                      id: true,
                      plan: true,
                      isWhiteLabel: true,
                    },
                  },
                },
                take: 1, // Get the first organization
              },
            },
          })
          
          if (userData?.OrganizationMember?.[0]?.Organization) {
            token.organization = userData.OrganizationMember[0].Organization
          }
        } catch (error) {
          // Log error but don't fail the session
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to fetch organization data:', error)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        
        if (token.organization) {
          session.user.organization = token.organization as {
            id: string
            plan: string
            isWhiteLabel: boolean
          }
        }
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true, // Important for Codespaces/proxied environments
})
