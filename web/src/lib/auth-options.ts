import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const getApiBaseUrl = () => {
  if (process.env.BACKEND_SERVICE_CORE_BASE_URL) return process.env.BACKEND_SERVICE_CORE_BASE_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        signup: { label: "Signup", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const isSignup = credentials.signup === "true";
          const endpoint = isSignup ? `${API_BASE_URL}/api/auth/signup` : `${API_BASE_URL}/api/auth/login`;
          
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              name: credentials.name,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Authentication failed");
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.message || "Authentication failed");
          }

          return {
            id: data.user?.id || "1",
            name: data.user?.name || credentials.email.split("@")[0],
            email: credentials.email,
          };
        } catch (error) {
          console.error("Database authentication error:", error);
          throw new Error(error instanceof Error ? error.message : "Unable to connect to database. Please try again later.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
