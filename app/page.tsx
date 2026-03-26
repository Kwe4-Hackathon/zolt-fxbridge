import { IconBoltFilled } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-white font-sans text-slate-900 w-full">
			{/* --- NAVIGATION --- */}
			<nav className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 py-4 sm:py-6 px-4 sm:px-6 md:px-10 lg:px-20  w-full bg-white ">
				{/* Logo Section */}
				<div className="flex items-center gap-2">
					<div className="bg-[#2D8A3E] p-1.5 sm:p-2 rounded-lg">
						<IconBoltFilled size={20} color="white" className="sm:w-5 sm:h-5" />
					</div>
					<span className="text-xl sm:text-2xl font-black tracking-tighter">
						ZOLT
					</span>
				</div>

				{/* Buttons - Stack on mobile, side by side on tablet+ */}
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
					<Link href="/login">
						<button className="border border-[#2D8A3E] text-[#2D8A3E] px-4 sm:px-5 lg:px-6 py-2 sm:py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-sm sm:text-base w-full sm:w-auto text-center">
							Login →
						</button>
					</Link>
					<Link href="/signup">
						<button className="bg-[#2D8A3E] text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2 rounded-lg font-semibold hover:bg-[#236b30] transition-colors text-sm sm:text-base w-full sm:w-auto text-center">
							Sign up →
						</button>
					</Link>
				</div>
			</nav>

			{/* --- HERO SECTION --- */}
			<section className="overflow-hidden bg-gradient-to-b from-white to-[#F8F9FA]">
				<div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12  flex flex-col lg:flex-row items-center justify-between w-full max-w-[1440px] min-h-[80vh] gap-8 lg:gap-12">
					{/* LEFT SIDE: Text Content */}
					<div className="z-10 w-full lg:w-1/2 text-center lg:text-left px-4 sm:px-0">
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px] leading-[1.2] font-black mb-4 sm:mb-6 lg:mb-8 tracking-tight">
							Early pay, Automatic savings, Transform your money habits
						</h1>
						<p className="text-gray-500 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 lg:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
							Support small businesses with simple invoicing, powerful
							integrations, and cash flow management tools.
						</p>

						{/* Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16 justify-center lg:justify-start">
							<Link href="/signup">
								<button className="bg-[#2D8A3E] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-lg shadow-green-200 hover:bg-[#257635] transition-colors">
									Get started
								</button>
							</Link>
							<button className="border border-gray-200 text-gray-700 px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg bg-white hover:border-gray-300 transition-colors">
								Learn more
							</button>
						</div>

						{/* Trusted By Section */}
						<div className="w-full">
							<p className="font-bold text-xs uppercase text-gray-400 mb-4 sm:mb-6 text-center lg:text-left">
								Trusted by <span className="text-gray-600">500+ Companies</span>
							</p>
							<div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 items-center justify-center lg:justify-start text-xl sm:text-2xl md:text-3xl text-[#1D5E2E] font-extrabold italic tracking-tighter">
								<span className="text-[#1D5E2E]">PATREON</span>
								<span className="text-2xl sm:text-3xl">Uber</span>
								<span>shopify</span>
								<span className="text-2xl sm:text-3xl">VISA</span>
							</div>
						</div>
					</div>

					{/* RIGHT SIDE: LARGER IMAGE */}
					<div className="relative w-full lg:w-1/2 flex justify-center items-center mt-8 lg:mt-0">
						<div className="relative w-full  mb-[-48px] max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
							<Image
								src="/phone.png"
								width={600}
								height={1300}
								alt="phone mockup showing Zolt app balance and transactions"
								className="w-full h-auto object-contain drop-shadow-2xl"
								priority
							/>

							{/* Optional: Decorative background glow */}
							<div className="absolute inset-0 bg-gradient-to-r from-[#34A853]/10 to-transparent rounded-full blur-3xl -z-10"></div>
						</div>
					</div>
				</div>
			</section>

			{/* --- PRE-FOOTER / CTA --- */}
			<section className="bg-[#1B4D26] py-24 text-center text-white px-6">
				<div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
					<div className="flex items-center gap-2 mb-2">
						<IconBoltFilled className="text-white" size={24} />
						<span className="text-xl font-bold tracking-tighter uppercase">
							Zolt
						</span>
					</div>
					<h2 className="text-5xl font-black">Get Started with ZOLT Today</h2>
					<p className="text-green-100/70 text-lg">
						Experience seamless, secure transactions at your fingertips. Sign up
						now and simplify your payments with just a few taps!
					</p>
					<button className="mt-4 bg-white text-[#1B4D26] px-8 py-3 rounded-lg font-bold flex items-center gap-2">
						Get started now &rsaquo;
					</button>
				</div>
			</section>

			{/* --- FOOTER --- */}
			<footer className="bg-white pt-20 pb-10 px-20 border-t border-gray-100">
				<div className="mx-auto grid grid-cols-1 md:grid-cols-6 gap-12 mb-20">
					<div className="md:col-span-2">
						<div className="flex items-center gap-2 mb-6">
							<div className="bg-[#2D8A3E] p-1.5 rounded-lg">
								<IconBoltFilled size={18} color="white" />
							</div>
							<span className="text-xl font-black tracking-tighter">ZOLT</span>
						</div>
						<p className="text-gray-400 text-sm leading-relaxed max-w-xs">
							Find quick solutions and helpful tips for using Zolt. We've
							compiled answers to the most frequently asked questions right
							here.
						</p>
					</div>

					{[
						{
							title: "About",
							links: ["Our story", "Careers", "Blog", "Contact Us"],
						},
						{
							title: "Resources",
							links: [
								"Help Center",
								"API Documentation",
								"Community",
								"Partners",
							],
						},
						{
							title: "Products",
							links: [
								"For Personal",
								"For Business",
								"Payment Solutions",
								"Integrations",
							],
						},
						{
							title: "Support",
							links: [
								"Customer Support",
								"FAQ",
								"Report a Problem",
								"Security & Privacy",
							],
						},
					].map((col) => (
						<div key={col.title}>
							<h4 className="font-bold text-slate-800 mb-6">{col.title}</h4>
							<ul className="space-y-4 text-gray-400 text-sm">
								{col.links.map((link) => (
									<li key={link}>
										<Link
											href="#"
											className="hover:text-green-600 transition-colors">
											{link}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-50 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
					<div className="flex gap-6 mb-4 md:mb-0">
						<Link href="#">Privacy Policy</Link>
						<Link href="#">Cookie Policy</Link>
						<Link href="#">Legal</Link>
					</div>
					<p>© 2026 Zolt Financial Services</p>
					<div className="flex gap-4 text-gray-400 text-lg">
						{/* Social Icons Placeholder */}
						<span className="cursor-pointer hover:text-green-600">𝕏</span>
						<span className="cursor-pointer hover:text-green-600">in</span>
						<span className="cursor-pointer hover:text-green-600">f</span>
						<span className="cursor-pointer hover:text-green-600">ig</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
