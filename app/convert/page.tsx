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

	const usdEquivalent =
		exchangeRate > 0 ? (ngnAmount - serviceFee) / exchangeRate : 0;

	const isAmountValid = ngnAmount > serviceFee;

	const handleLockRate = async () => {
		if (!isAmountValid) {
			toast.error(
				`Amount must be greater than ₦${serviceFee.toLocaleString()} to cover fees`,
			);
			return;
		}

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
				const error = await response.json();
				throw new Error(error.error || "Failed to lock rate");
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to lock rate. Try again.");
		}
	};

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="convert" />

			<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
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
						<span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
							Live FX Engine
						</span>
					</div>
				</header>

				<section className="bg-[#E8F5E9] rounded-[32px] sm:rounded-[40px] p-4 sm:p-6 md:p-8 lg:p-12 max-w-5xl mx-auto shadow-sm">
					{/* Current Rate Display */}
					<div className="flex flex-col items-center mb-8 sm:mb-10 md:mb-12">
						<span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
							Current Market Rate ({provider})
						</span>

						<div className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-sm flex items-center gap-2 sm:gap-3">
							<span
								className={`font-bold text-base sm:text-lg ${
									loading ? "animate-pulse text-gray-300" : ""
								}`}>
								1 USD ={" "}
								{exchangeRate > 0
									? exchangeRate.toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})
									: "---"}{" "}
								NGN
							</span>

							<RefreshCcw
								size={16}
								onClick={fetchLiveRate}
								className={`text-[#34A853] cursor-pointer hover:rotate-180 transition-transform duration-300 ${
									loading ? "animate-spin" : ""
								}`}
							/>
						</div>
					</div>

					{/* Amount Input */}
					<div className="space-y-6 mb-8 sm:mb-10 md:mb-12">
						<div className="flex flex-col items-center">
							<label className="text-xs sm:text-sm font-bold text-gray-500 mb-2 sm:mb-3 uppercase tracking-wide">
								Enter Amount in NGN
							</label>

							<div className="bg-white w-full flex flex-col sm:flex-row items-center p-4 sm:p-6 rounded-[24px] shadow-sm gap-4 sm:gap-0">
								<input
									type="number"
									value={ngnAmount}
									onChange={(e) => setNgnAmount(Number(e.target.value))}
									className="text-2xl sm:text-3xl font-black flex-1 outline-none bg-transparent w-full text-center sm:text-left"
									placeholder="Enter amount"
									min={serviceFee + 1}
								/>

								<div className="flex items-center gap-2 sm:gap-3 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
									<img
										src="https://flagcdn.com/w40/ng.png"
										className="w-6 h-5 sm:w-8 sm:h-6"
										alt="Nigeria flag"
									/>
									<span className="font-black text-lg sm:text-xl">NGN</span>
								</div>
							</div>

							{!isAmountValid && ngnAmount > 0 && (
								<p className="mt-2 text-xs text-red-500">
									Minimum amount is ₦{serviceFee.toLocaleString()} (covers
									service fee)
								</p>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-12 sm:mb-16">
						<button
							onClick={handleLockRate}
							disabled={loading || !isAmountValid || exchangeRate === 0}
							className={`bg-[#34A853] text-white cursor-pointer px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all hover:scale-105 active:scale-95 ${
								loading || !isAmountValid || exchangeRate === 0
									? "opacity-50 cursor-not-allowed hover:scale-100"
									: ""
							}`}>
							Lock Rate
						</button>

						<button
							onClick={() => router.push("/transfer")}
							className="border-2 border-[#34A853] cursor-pointer text-[#34A853] px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:bg-[#34A853]/5 transition-all">
							Send Payment
						</button>
					</div>

					{/* Summary Cards */}
					<div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
						<div className="bg-white/60 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center">
							<span className="text-xs sm:text-sm text-gray-500 font-bold uppercase">
								You Send
							</span>
							<span className="text-xl sm:text-2xl font-black">
								₦{ngnAmount.toLocaleString()}
							</span>
						</div>

						<div className="bg-white/60 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center">
							<span className="text-xs sm:text-sm text-gray-500 font-bold uppercase">
								FX Fee
							</span>
							<span className="text-lg sm:text-xl font-black text-[#D93025]">
								₦{serviceFee.toLocaleString()}
							</span>
						</div>

						<div className="bg-white/60 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center">
							<span className="text-xs sm:text-sm text-gray-500 font-bold uppercase">
								Recipient Gets
							</span>
							<span className="text-xl sm:text-2xl font-black text-[#34A853]">
								${usdEquivalent > 0 ? usdEquivalent.toFixed(2) : "0.00"}
							</span>
						</div>
					</div>
				</section>

				{/* Footer */}
				<div className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm italic">
					Live FX rates updated every 60 seconds.
					{exchangeRate > 0 && <> 1 USD = ₦{exchangeRate.toFixed(2)} NGN</>}
				</div>
			</main>
		</div>
	);
}
