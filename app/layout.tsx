import { Providers } from "@/components/Provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Zolt - Secure Cross-Border Payments & Currency Exchange",
	description:
		"Lock in exchange rates, pay international suppliers instantly, and manage cross-border payments with Zolt. Secure, fast, and built for Nigerian businesses.",
	keywords:
		"currency exchange, cross-border payments, NGN to USD, international transfers, supplier payments, rate locking, Zolt",
	authors: [{ name: "Zolt", url: "https://zolt.app" }],
	creator: "Zolt",
	publisher: "Zolt",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		title: "Zolt - Lock Rates, Pay Suppliers, Save on Cross-Border Payments",
		description:
			"Secure the exchange rate you want, pay international vendors instantly, and save up to 20% on cross-border payments with Zolt.",
		url: "https://zolt.app",
		siteName: "Zolt",
		images: [
			{
				url: "https://zolt.app/og-image.png",
				width: 1200,
				height: 630,
				alt: "Zolt - Cross-Border Payments Made Easy",
			},
		],
		locale: "en_NG",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Zolt - Secure Cross-Border Payments",
		description:
			"Lock exchange rates, pay suppliers in USD, and manage international payments all from one dashboard.",
		images: ["https://zolt.app/twitter-image.png"],
		creator: "@zolt",
		site: "@zolt",
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
	alternates: {
		canonical: "https://zolt.app",
	},
	category: "finance",
	applicationName: "Zolt",
	appleWebApp: {
		capable: true,
		title: "Zolt",
		statusBarStyle: "black-translucent",
	},
	formatDetection: {
		telephone: true,
		date: true,
		address: true,
		email: true,
		url: true,
	},
	verification: {
		google: "your-google-site-verification-code",
		// other verification codes
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">
				<Providers>
					{children} <Toaster position="top-center" reverseOrder={false} />
				</Providers>
			</body>
		</html>
	);
}
