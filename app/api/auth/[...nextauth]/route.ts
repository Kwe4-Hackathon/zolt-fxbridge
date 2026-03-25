import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				await connectDB();
				const user = await User.findOne({ email: credentials?.email });
				if (user && bcrypt.compareSync(credentials!.password, user.password)) {
					return { id: user._id, name: user.name, email: user.email };
				}
				return null;
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			session.user.id = token.sub;
			return session;
		},
	},
	pages: { signIn: "/login" },
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
