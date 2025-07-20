import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "@/lib/validators/auth"
import { verifyPassword } from "@/lib/utils"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {}
            },
            authorize: async (credentials) => {
                try {
                    const { email, password } = loginSchema.parse(credentials);

                    const user = await prisma.user.findUnique({
                        where: {
                            email: email
                        }
                    })
            
                    if (!user || !user.password) {
                        return null;
                    }

                    const passwordsMatch = await verifyPassword(password, user.password);

                    if (!passwordsMatch) {
                        return null;
                    }

                    return user;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
})
