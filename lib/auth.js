import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "./db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role,
          companyName: user.companyName,
          companyLogo: user.companyLogo,
          timezone: user.timezone,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.plan = user.plan;
        token.role = user.role;
        token.companyName = user.companyName;
        token.companyLogo = user.companyLogo;
        token.timezone = user.timezone;
      }

       if (trigger === "update" && session?.user) {
        if (session.user.name !== undefined) token.name = session.user.name;
        if (session.user.email !== undefined) token.email = session.user.email;
        if (session.user.plan !== undefined) token.plan = session.user.plan;
        if (session.user.role !== undefined) token.role = session.user.role;
        if (session.user.companyName !== undefined) token.companyName = session.user.companyName;
        if (session.user.companyLogo !== undefined) token.companyLogo = session.user.companyLogo;
        if (session.user.timezone !== undefined) token.timezone = session.user.timezone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;

        if (token.id) {
          const freshUser = await db.user.findUnique({
            where: { id: token.id },
            select: { name: true, email: true, plan: true, role: true, companyName: true, companyLogo: true, timezone: true },
          });

          session.user.name = freshUser?.name ?? token.name;
          session.user.email = freshUser?.email ?? token.email;
          session.user.plan = freshUser?.plan ?? token.plan;
          session.user.role = freshUser?.role ?? token.role;
          session.user.companyName = freshUser?.companyName ?? token.companyName;
          session.user.companyLogo = freshUser?.companyLogo ?? token.companyLogo;
          session.user.timezone = freshUser?.timezone ?? token.timezone;
        } else {
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.plan = token.plan;
          session.user.role = token.role;
          session.user.companyName = token.companyName;
          session.user.companyLogo = token.companyLogo;
          session.user.timezone = token.timezone;
        }
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
