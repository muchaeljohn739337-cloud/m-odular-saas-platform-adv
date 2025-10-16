import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { User } from "next-auth"

// Get NextAuth secret (supports Base64 encoded)
function getNextAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET_BASE64) {
    return Buffer.from(process.env.NEXTAUTH_SECRET_BASE64, 'base64').toString('utf8');
  }
  return process.env.NEXTAUTH_SECRET || '';
}

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Replace with actual authentication logic
        // This is a placeholder implementation
        if (credentials?.email && credentials?.password) {
          const user: User = {
            id: "1",
            email: credentials.email,
            name: "Test User"
          }
          return user
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        const userWithId = session.user as typeof session.user & { id?: string }
        userWithId.id = typeof token.id === "string" ? token.id : undefined
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
