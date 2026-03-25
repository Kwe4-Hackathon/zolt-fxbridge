import { withAuth } from "next-auth/middleware";

export default withAuth({
	pages: {
		signIn: "/login",
	},
});

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/convert/:path*",
		"/api/wallet/:path*",
		"/api/fx/:path*",
		"/rate-lock/:path*",
		"/transfer/:path*",
		"/api/user/:path*",
		"/api/transactions/:path*",
	],
};
