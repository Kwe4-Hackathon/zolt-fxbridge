"use client";
import Sidebar from "@/components/Sidebar";
import { RefreshCcw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ConvertPage() {
	const router = useRouter();

	const [ngnAmount, setNgnAmount] = useState<number>(1512000);
	const [exchangeRate, setExchangeRate] = useState<number>(0);
	const [serviceFee, setServiceFee] = useState<number>(12000);
	const [loading, setLoading] = useState<boolean>(true);
	const [provider, setProvider] = useState<string>("Live FX");

	// ✅ FETCH REAL RATE (FROM YOUR FIXED BACKEND)
	const fetchLiveRate = async () => {
		try {
			setLoading(true);

			const res = await fetch("/api/fx/rate", {
				cache: "no-store",
			});

			if (!res.ok) {
				throw new Error("Failed to fetch rate");
			}

			const data = await res.json();

			if (!data.rate) {
				throw new Error("Invalid rate response");
			}

			setExchangeRate(data.rate);
			setProvider(data.provider || "Live FX");
		} catch (err) {
			console.error(err);
			toast.error("Failed to fetch live FX rate");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLiveRate();
		const interval = setInterval(fetchLiveRate, 60000);
		return () => clearInterval(interval);
	}, []);

	// ✅ SAFE CALCULATION
	const usdEquivalent =
		exchangeRate > 0 ? (ngnAmount - serviceFee) / exchangeRate : 0;

	const handleLockRate = async () => {
		try {
			const response = await fetch("/api/fx/lock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					rate: exchangeRate,
					amountNgn: ngnAmount,
					amountUsd: usdEquivalent,
					provider,
				}),
			});

			if (response.ok) {
				toast.success(
					`Rate of ₦${exchangeRate.toFixed(2)} = $1 secured via ${provider}!`,
				);
				router.push("/rate-lock");
			} else {
				throw new Error();
			}
		} catch {
			toast.error("Failed to lock rate. Try again.");
		}
	};

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="convert" />

			<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12">
				<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 md:mb-10">
					<div>
						<h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
							Currency Converter
						</h1>
						<p className="text-sm sm:text-base text-gray-500 font-medium">
							Convert NGN to USD at real-time rates
						</p>
					</div>

					<div className="flex items-center gap-2 bg-[#00425F] text-white px-3 sm:px-4 py-2 rounded-full shadow-md">
						<ShieldCheck size={14} className="text-[#00CCFF]" />
						<span className="text-[10px] font-black uppercase tracking-widest">
							Live FX Engine
						</span>
					</div>
				</header>

				<section className="bg-[#E8F5E9] rounded-[40px] p-4 sm:p-6 md:p-8 lg:p-12 max-w-5xl mx-auto shadow-sm">
					<div className="flex flex-col items-center mb-10">
						<span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
							Current Market Rate ({provider})
						</span>

						<div className="bg-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
							<span
								className={`font-black text-lg ${
									loading ? "animate-pulse text-gray-300" : ""
								}`}>
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
								className={`text-[#34A853] cursor-pointer ${
									loading ? "animate-spin" : ""
								}`}
							/>
						</div>
					</div>

					<div className="space-y-6 mb-12">
						<div className="flex flex-col items-center">
							<label className="text-sm font-bold text-gray-500 mb-3 uppercase">
								Enter Amount in NGN
							</label>

							<div className="bg-white w-full flex items-center p-6 rounded-[24px] shadow-sm">
								<input
									type="number"
									value={ngnAmount}
									onChange={(e) => setNgnAmount(Number(e.target.value))}
									className="text-3xl font-black flex-1 outline-none bg-transparent"
								/>

								<div className="flex items-center gap-3 border-l pl-6 ml-6">
									<img
										src="https://flagcdn.com/w40/ng.png"
										className="w-8 h-6"
									/>
									<span className="font-black text-xl">NGN</span>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-center gap-6 mb-16">
						<button
							onClick={handleLockRate}
							disabled={loading || ngnAmount <= serviceFee}
							className="bg-[#34A853] text-white cursor-pointer px-12 py-4 rounded-2xl font-black text-lg">
							Lock Rate
						</button>

						<button
							onClick={() => router.push("/transfer")}
							className="border-2 border-[#34A853] cursor-pointer text-[#34A853] px-12 py-4 rounded-2xl font-black text-lg">
							Send Payment
						</button>
					</div>

					<div className="max-w-2xl mx-auto space-y-4">
						<div className="bg-white/60 p-6 rounded-2xl flex justify-between">
							<span className="text-gray-500 font-bold uppercase">
								You Send
							</span>
							<span className="text-2xl font-black">
								₦{ngnAmount.toLocaleString()}
							</span>
						</div>

						<div className="bg-white/60 p-6 rounded-2xl flex justify-between">
							<span className="text-gray-500 font-bold uppercase">FX Fee</span>
							<span className="text-xl font-black text-[#D93025]">
								₦{serviceFee.toLocaleString()}
							</span>
						</div>

						<div className="bg-white/60 p-6 rounded-2xl flex justify-between">
							<span className="text-gray-500 font-bold uppercase">
								Recipient Gets
							</span>
							<span className="text-2xl font-black text-[#34A853]">
								${usdEquivalent.toFixed(2)}
							</span>
						</div>
					</div>
				</section>

				<div className="mt-8 text-center text-gray-400 text-sm italic">
					Live FX rates updated every 60 seconds. 1 USD ={" "}
					{exchangeRate.toFixed(2)} NGN
				</div>
			</main>
		</div>
	);
}
