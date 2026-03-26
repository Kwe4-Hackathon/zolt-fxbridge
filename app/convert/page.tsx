"use client";
import Sidebar from "@/components/Sidebar";
import { Info, RefreshCcw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ConvertPage() {
	const router = useRouter();

	// --- State Management ---
	const [ngnAmount, setNgnAmount] = useState<number>(1512000);
	const [exchangeRate, setExchangeRate] = useState<number>(1392.86);
	const [serviceFee, setServiceFee] = useState<number>(12000);
	const [loading, setLoading] = useState<boolean>(true);
	const [provider, setProvider] = useState<string>("Zolt Engine");

	// --- Fetch Real Rate from Interswitch API (NGN to USD only) ---
	const fetchLiveRate = async () => {
		try {
			setLoading(true);
			// Force NGN to USD
			const res = await fetch("/api/fx/rate?from=NGN&to=USD");
			const data = await res.json();

			if (data.rate) {
				setExchangeRate(data.rate);
				setServiceFee(data.fee || 12000);
				setProvider(data.provider || "Interswitch");
			}
		} catch (err) {
			toast.error("Failed to sync with Interswitch market rates");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLiveRate();
		const interval = setInterval(fetchLiveRate, 60000); // Auto-refresh every 60s
		return () => clearInterval(interval);
	}, []);

	// --- Math logic (NGN to USD only) ---
	const usdEquivalent = (ngnAmount - serviceFee) / exchangeRate;

	const handleLockRate = async () => {
		try {
			const response = await fetch("/api/fx/lock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					rate: exchangeRate,
					amountNgn: ngnAmount,
					amountUsd: usdEquivalent,
					provider: provider,
				}),
			});

			if (response.ok) {
				toast.success(
					`Rate of ₦${exchangeRate.toFixed(2)} = $1 secured via ${provider}!`,
				);
				router.push("/rate-lock");
			} else {
				toast.error("Failed to lock rate. Try again.");
			}
		} catch (error) {
			toast.error("Failed to lock rate. Try again.");
		}
	};

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="convert" />

			<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12">
				{/* Header - Responsive */}
				<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 md:mb-10">
					<div>
						<h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
							Currency Converter
						</h1>
						<p className="text-sm sm:text-base text-gray-500 font-medium">
							Convert NGN to USD at real-time rates
						</p>
					</div>

					{/* Hackathon Badge: Powered by Interswitch */}
					<div className="flex items-center gap-2 bg-[#00425F] text-white px-3 sm:px-4 py-2 rounded-full shadow-md">
						<ShieldCheck size={14} className="text-[#00CCFF] sm:w-4 sm:h-4" />
						<span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
							Powered by Interswitch
						</span>
					</div>
				</header>

				{/* Main Converter Card */}
				<section className="bg-[#E8F5E9] rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-8 lg:p-12 max-w-5xl mx-auto shadow-sm">
					{/* Top Rate Badge */}
					<div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-10">
						<span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
							Current Market Rate ({provider})
						</span>
						<div className="bg-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm flex items-center gap-2 sm:gap-3">
							<span
								className={`font-bold sm:font-black text-sm sm:text-base md:text-lg ${loading ? "animate-pulse text-gray-300" : ""}`}>
								1 USD ={" "}
								{exchangeRate.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}{" "}
								NGN
							</span>
							<RefreshCcw
								size={16}
								onClick={fetchLiveRate}
								className={`text-[#34A853] cursor-pointer hover:rotate-180 transition-transform duration-500 flex-shrink-0 ${loading ? "animate-spin" : ""}`}
							/>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							Exchange rate: 1 USD = {exchangeRate.toFixed(2)} NGN
						</p>
					</div>

					{/* Input Area - NGN to USD */}
					<div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10 md:mb-12">
						<div className="flex flex-col items-center">
							<label className="text-xs sm:text-sm font-bold text-gray-500 mb-2 sm:mb-3 uppercase">
								Enter Amount in NGN
							</label>
							<div className="bg-white w-full flex items-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl md:rounded-[24px] shadow-sm border border-transparent focus-within:border-[#34A853] focus-within:ring-2 focus-within:ring-[#34A853]/20 transition-all">
								<input
									type="number"
									value={ngnAmount}
									onChange={(e) => setNgnAmount(Number(e.target.value))}
									className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black flex-1 outline-none bg-transparent min-w-0"
									placeholder="0"
								/>
								<div className="flex items-center gap-2 sm:gap-3 border-l pl-3 sm:pl-4 md:pl-6 ml-2 sm:ml-3 md:ml-6">
									<img
										src="https://flagcdn.com/w40/ng.png"
										className="w-6 h-4 sm:w-8 sm:h-6 rounded-sm object-cover"
										alt="NGN"
									/>
									<span className="font-bold sm:font-black text-sm sm:text-base md:text-xl">
										NGN
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons - Responsive Stack on Mobile */}
					<div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-16">
						<button
							onClick={handleLockRate}
							disabled={loading || ngnAmount <= serviceFee}
							className="bg-[#34A853] text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold sm:font-black text-base sm:text-lg hover:scale-105 transition-transform shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
							Lock Rate
						</button>
						<button
							onClick={() => router.push("/transfer")}
							className="border-2 border-[#34A853] text-[#34A853] px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold sm:font-black text-base sm:text-lg hover:bg-[#34A853]/5 transition-colors">
							Send Payment
						</button>
					</div>

					{/* Breakdown Section */}
					<div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
						<div className="flex items-center gap-2 mb-3 sm:mb-4">
							<h3 className="font-black text-base sm:text-lg uppercase tracking-tight">
								Conversion Breakdown
							</h3>
							<Info size={14} className="text-gray-400 sm:w-4 sm:h-4" />
						</div>

						<div className="bg-white/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border border-white/40">
							<span className="text-gray-500 font-bold text-xs sm:text-sm uppercase">
								You Send
							</span>
							<span className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
								₦
								{ngnAmount.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>

						<div className="bg-white/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border border-white/40">
							<span className="text-gray-500 font-bold text-xs sm:text-sm uppercase">
								FX Conversion Fee
							</span>
							<span className="text-lg sm:text-xl font-black text-[#D93025]">
								₦{serviceFee.toLocaleString()}
							</span>
						</div>

						<div className="bg-white/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border border-white/40">
							<span className="text-gray-500 font-bold text-xs sm:text-sm uppercase">
								Recipient Receives (USD)
							</span>
							<span
								className={`text-xl sm:text-2xl font-black text-[#34A853] ${loading ? "animate-pulse" : ""}`}>
								$
								{usdEquivalent.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>

						{ngnAmount <= serviceFee && (
							<div className="bg-red-50 p-3 sm:p-4 rounded-xl">
								<p className="text-xs sm:text-sm text-center text-red-600">
									Amount must be greater than the service fee (₦
									{serviceFee.toLocaleString()})
								</p>
							</div>
						)}
					</div>
				</section>

				{/* Market Notice */}
				<div className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm font-medium italic px-4">
					Rates are verified by Interswitch and updated every 60 seconds. 1 USD
					= {exchangeRate.toFixed(2)} NGN
				</div>
			</main>
		</div>
	);
}
