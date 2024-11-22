import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    // Credentials Provider for username and password authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validate credentials input
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password.");
        }

        // Fetch user from the database
        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
          include: {
            profile: true, // Fetch related profile information
          },
        });

        if (!user) {
          throw new Error("User not found.");
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        // Return user object to be encoded in the session and JWT
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          profileImg: user.profile?.profile_img || null, // Include profile image
        };
      },
    }),

    // Google Provider for OAuth authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Use JWT for sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT options
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    // Attach user data to the session object
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username || token.email?.split("@")[0], // Use email username if username is unavailable
          email: token.email,
          profileImg: token.profileImg, // Include profile image in session
        };
      }
      return session;
    },

    // Attach user data to the JWT
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.profileImg = user.profileImg; // Include profile image in JWT
      }

      // Add data for Google account
      if (account?.provider === "google") {
        token.id = profile.sub || profile.id; // Use `sub` if available for Google profiles
        token.username = profile.name || profile.email.split("@")[0]; // Fallback to email username
        token.email = profile.email;
        token.profileImg = profile.picture || null; // Use Google profile picture
      }

      return token;
    },

    // Callback to handle custom logic for signing in
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        try {
          // Ensure the user exists in your database
          const userExists = await prisma.user.findFirst({
            where: { email: profile.email },
          });

          if (!userExists) {
            // If the user doesn't exist, create one
            await prisma.user.create({
              data: {
                username: profile.name || profile.email.split("@")[0], // Fallback to email username
                email: profile.email,
                role: 'user',
                user_id: `user_${Date.now()}`,
                profile: {
                  create: {
                    profile_img: profile.picture || null,
                  },
                },
              },
            });
            
            await prisma.userProfile.create({
              data: {
                userId: newUser.id,
                name: name,
              },
            });
          }
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false; // Deny sign-in if there's an error
        }
      }
      return true; // Allow sign-in
    },

    // Handle redirects to ensure valid URLs
    async redirect({ url, baseUrl }) {
      // Only allow redirects to the same origin
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: "/auth/login", // Redirect here for login
    error: "/auth/error", // Redirect here for errors
  },

  // Use secure secret for signing and encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Debugging for development; disable in production
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
