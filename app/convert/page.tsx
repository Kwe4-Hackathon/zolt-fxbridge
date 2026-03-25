"use client";
import Sidebar from "@/components/Sidebar";
import { Info, RefreshCcw, ShieldCheck } from "lucide-react"; // Added ShieldCheck for the badge
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

	// --- Fetch Real Rate from Interswitch API ---
	const fetchLiveRate = async () => {
		try {
			setLoading(true);
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

	// --- Math logic ---
	const usdEquivalent = (ngnAmount - serviceFee) / exchangeRate;

	const handleLockRate = async () => {
		try {
			const response = await fetch("/api/fx/lock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					rate: exchangeRate,
					amountNgn: ngnAmount,
					provider: provider,
				}),
			});

			if (response.ok) {
				toast.success(`Rate of ${exchangeRate} secured via Interswitch!`);
				router.push("/rate-lock");
			}
		} catch (error) {
			toast.error("Failed to lock rate. Try again.");
		}
	};

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="convert" />

			<main className="flex-1 p-12">
				<header className="flex justify-between items-start mb-10">
					<div>
						<h1 className="text-3xl font-black text-[#1A1A1A]">
							Currency Converter
						</h1>
						<p className="text-gray-500 font-medium">
							Get real-time mid-market exchange rates.
						</p>
					</div>
					{/* Hackathon Badge: Powered by Interswitch */}
					<div className="flex items-center gap-2 bg-[#00425F] text-white px-4 py-2 rounded-full shadow-md">
						<ShieldCheck size={16} className="text-[#00CCFF]" />
						<span className="text-[10px] font-black uppercase tracking-widest">
							Powered by Interswitch
						</span>
					</div>
				</header>

				<section className="bg-[#E8F5E9] rounded-[40px] p-12 max-w-5xl mx-auto shadow-sm">
					{/* Top Rate Badge */}
					<div className="flex flex-col items-center mb-10">
						<span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
							Current Market Rate ({provider})
						</span>
						<div className="bg-white px-8 py-3 rounded-2xl shadow-sm flex items-center gap-3">
							<span
								className={`font-black text-lg ${loading ? "animate-pulse text-gray-300" : ""}`}>
								1 USD ≈{" "}
								{exchangeRate.toLocaleString(undefined, {
									minimumFractionDigits: 2,
								})}{" "}
								NGN
							</span>
							<RefreshCcw
								size={16}
								onClick={fetchLiveRate}
								className={`text-[#34A853] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`}
							/>
						</div>
					</div>

					{/* Input Area */}
					<div className="space-y-6 mb-12">
						<div className="flex flex-col items-center">
							<label className="text-sm font-bold text-gray-500 mb-3 uppercase">
								Enter Amount in NGN
							</label>
							<div className="bg-white w-full max-w-2xl flex items-center p-6 rounded-[24px] shadow-sm border border-transparent focus-within:border-[#34A853] transition-all">
								<input
									type="number"
									value={ngnAmount}
									onChange={(e) => setNgnAmount(Number(e.target.value))}
									className="text-4xl font-black flex-1 outline-none bg-transparent"
								/>
								<div className="flex items-center gap-3 border-l pl-6 ml-6">
									<img
										src="https://flagcdn.com/w40/ng.png"
										className="w-8 h-6 rounded-sm object-cover"
										alt="NGN"
									/>
									<span className="font-black text-xl">NGN</span>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-center gap-6 mb-16">
						<button
							onClick={handleLockRate}
							disabled={loading}
							className="bg-[#34A853] text-white px-12 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-lg shadow-green-200 disabled:opacity-50">
							Lock Rate
						</button>
						<button
							onClick={() => router.push("/transfer")}
							className="border-2 border-[#34A853] text-[#34A853] px-12 py-4 rounded-2xl font-black text-lg hover:bg-[#34A853]/5 transition-colors">
							Send Payment
						</button>
					</div>

					{/* Breakdown Section */}
					<div className="max-w-2xl mx-auto space-y-4">
						<div className="flex items-center gap-2 mb-4">
							<h3 className="font-black text-lg uppercase tracking-tight">
								Conversion Breakdown
							</h3>
							<Info size={16} className="text-gray-400" />
						</div>

						<div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl flex justify-between items-center border border-white/40">
							<span className="text-gray-500 font-bold text-sm uppercase">
								Converted Value (Supplier Receives)
							</span>
							<span
								className={`text-2xl font-black text-[#1A1A1A] ${loading ? "animate-pulse" : ""}`}>
								$
								{usdEquivalent.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>

						<div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl flex justify-between items-center border border-white/40">
							<span className="text-gray-500 font-bold text-sm uppercase">
								FX Conversion Fee
							</span>
							<span className="text-xl font-black text-[#D93025]">
								₦{serviceFee.toLocaleString()}
							</span>
						</div>
					</div>
				</section>

				{/* Market Notice */}
				<div className="mt-8 text-center text-gray-400 text-sm font-medium italic">
					Rates are verified by Interswitch and updated every 60 seconds.
				</div>
			</main>
		</div>
	);
}
