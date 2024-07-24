import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, Role, User as PrismaUser } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
      };

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        const existingSession = await prisma.session.findUnique({
          where: { userId: user.id },
        });

        if (existingSession) {
          await prisma.session.update({
            where: { id: existingSession.id },
            data: {
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          await prisma.session.create({
            data: {
              userId: user.id,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              sessionToken: crypto.randomUUID(),
            },
          });
        }
      }
    },
  },
};
