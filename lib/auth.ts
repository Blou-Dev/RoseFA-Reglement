import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { OWNER_ROLE, WRITER_ROLE } from "@/lib/auth-shared";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "RoseFA Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = normalizeEmail(email);

        const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const ownerPassword = process.env.ADMIN_PASSWORD;

        if (ownerEmail && ownerPassword && normalizedEmail === ownerEmail) {
          const plainMatch = password === ownerPassword;
          const hashMatch = ownerPassword.startsWith("$2") ? await compare(password, ownerPassword) : false;

          if (plainMatch || hashMatch) {
            return {
              id: "rosefa-owner",
              email: ownerEmail,
              name: "RoseFA Admin",
              role: OWNER_ROLE,
            };
          }
        }

        const writer = await prisma.adminUser.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

        if (!writer || !writer.isActive) {
          return null;
        }

        const passwordMatch = await compare(password, writer.passwordHash);
        if (!passwordMatch) {
          return null;
        }

        return {
          id: writer.id,
          email: writer.email,
          name: writer.name,
          role: WRITER_ROLE,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string | undefined;
        session.user.name = token.name as string | undefined;
        session.user.role = token.role as string | undefined;
      }

      return session;
    },
  },
};
