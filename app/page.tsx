import Link from "next/link";

export default function LandingPage() {
	return (
		<div className="min-h-screen">
			<nav className="flex justify-between items-center p-6 px-12">
				<div className="flex items-center gap-2">
					<div className="bg-[#34A853] p-1.5 rounded-lg">
						<img src="/logo-white.svg" className="w-6 h-6" />
					</div>
					<span className="text-2xl font-black">ZOLT</span>
				</div>
				<div className="flex gap-4">
					<Link href="/login">
						<button className="border border-gray-300 px-6 py-2 rounded-lg font-bold">
							Login &rsaquo;
						</button>
					</Link>

					<Link href="/signup">
						<button className="bg-[#34A853] text-white px-6 py-2 rounded-lg font-bold">
							Sign up &rsaquo;
						</button>
					</Link>
				</div>
			</nav>

			<section className="px-12 py-20 flex items-center">
				<div className="w-1/2">
					<h1 className="text-6xl font-black leading-tight mb-6">
						Early pay, Automatic savings, Transform your money habits
					</h1>
					<p className="text-gray-500 text-lg mb-10 max-w-lg">
						Support small businesses with simple invoicing, powerful
						integrations, and cash flow management tools.
					</p>
					<div className="flex gap-4">
						<Link href="/signup">
							<button className="bg-[#34A853] text-white px-8 py-4 rounded-xl font-bold">
								Get started
							</button>
						</Link>
						<button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold">
							Learn more
						</button>
					</div>

					<div className="mt-12 flex gap-8 items-center opacity-60">
						<span className="font-bold text-xs uppercase text-gray-400">
							Trusted by 500+ Companies
						</span>
						{/* Brand Logos */}
						<div className="flex gap-6 grayscale font-black text-xl italic">
							<span>PATREON</span> <span>Uber</span> <span>shopify</span>{" "}
							<span>VISA</span>
						</div>
					</div>
				</div>

				<div className="w-1/2 flex justify-end">
					<div className="relative w-[400px] h-[600px] bg-[#34A853] rounded-[40px] p-6 shadow-2xl">
						{/* Mock UI inside the phone */}
						<div className="bg-white/10 rounded-2xl p-4 text-white">
							<p className="text-xs">Total Balance</p>
							<h2 className="text-3xl font-black">₦ 80,000</h2>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
