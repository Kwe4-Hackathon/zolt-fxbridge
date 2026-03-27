"use client";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RateLockPage() {
	const router = useRouter();
	const [lockData, setLockData] = useState<any>(null);
	const [timeLeft, setTimeLeft] = useState<number>(0);
	const [loading, setLoading] = useState(true);

	// 1. Fetch the actual locked data from MongoDB
	useEffect(() => {
		const fetchLock = async () => {
			try {
				const res = await fetch("/api/user/wallet");
				const data = await res.json();

				if (
					data.lockedRate &&
					new Date(data.lockedRate.expiresAt) > new Date()
				) {
					setLockData(data.lockedRate);
					// Calculate initial seconds remaining
					const remaining = Math.floor(
						(new Date(data.lockedRate.expiresAt).getTime() -
							new Date().getTime()) /
							1000,
					);
					setTimeLeft(remaining);
				} else {
					toast.error("No active or valid rate lock found.");
					router.push("/convert");
				}
			} catch (err) {
				toast.error("Failed to load rate data.");
			} finally {
				setLoading(false);
			}
		};
		fetchLock();
	}, [router]);

	// 2. Countdown Logic
	useEffect(() => {
		if (timeLeft <= 0) return;
		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [timeLeft]);

	const formatTime = (seconds: number) => {
		if (seconds <= 0) return "00 : 00 : 00";
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		return `${h.toString().padStart(2, "0")} : ${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
	};

	if (loading)
		return (
			<div className="flex min-h-screen bg-[#F8F9FA]">
				<Sidebar active="rate-lock" />
				<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34A853] mx-auto mb-4"></div>
						<p className="text-gray-600 font-medium">Checking Rate Status...</p>
					</div>
				</main>
			</div>
		);

	if (!lockData) return null;

	// Calculation constants
	const FEE = 12000;
	const usdEquivalent = (lockData.amountNgn - FEE) / lockData.rate;
	const totalDebit = lockData.amountNgn;
	const isExpiringSoon = timeLeft < 300; // 5 minutes warning

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="rate-lock" />

			<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
				<div className="max-w-4xl mx-auto">
					{/* Header Section */}
					<div className="text-center mb-8 sm:mb-10 md:mb-12">
						<p className="text-gray-400 font-black mb-2 uppercase text-[8px] sm:text-[9px] md:text-[10px] tracking-widest">
							Your Secured Rate
						</p>
						<div className="bg-[#E1F5FE] border-2 border-[#B3E5FC] inline-block px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-[20px] font-black text-xl sm:text-2xl mb-4 text-[#01579B]">
							1 USD = ₦{lockData.rate.toLocaleString()}
						</div>
						<div className="text-gray-500 font-bold flex flex-col sm:flex-row items-center justify-center gap-2">
							<span>Lock Expires In:</span>
							<span
								className={`font-black text-lg sm:text-xl ${
									isExpiringSoon
										? "text-red-500 animate-pulse"
										: "text-[#34A853]"
								}`}>
								{formatTime(timeLeft)}
							</span>
						</div>
						{isExpiringSoon && (
							<p className="mt-2 text-xs text-red-500 font-medium">
								⚠️ Rate lock expiring soon! Complete your transfer quickly.
							</p>
						)}
					</div>

					{/* Transfer Preview Card */}
					<section className="bg-[#E8F5E9] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm border border-white/50">
						<h2 className="text-lg sm:text-xl font-black mb-6 sm:mb-8 uppercase tracking-tight">
							Transfer Preview
						</h2>

						<div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
							<PreviewRow
								label="YOU SEND"
								value={`₦${(lockData.amountNgn - FEE).toLocaleString()}`}
							/>
							<PreviewRow
								label="SUPPLIER RECEIVES"
								value={`$${usdEquivalent.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}`}
							/>
							<PreviewRow
								label="FX CONVERSION FEE"
								value={`₦${FEE.toLocaleString()}`}
							/>
							<PreviewRow
								label="TOTAL DEBIT"
								value={`₦${totalDebit.toLocaleString()}`}
								isTotal
							/>
						</div>

						<div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
							<button
								onClick={() => router.push("/transfer")}
								disabled={timeLeft <= 0}
								className={`bg-[#34A853] cursor-pointer text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 rounded-[22px] font-black text-base sm:text-lg transition-all shadow-xl shadow-green-100 active:scale-95 hover:scale-105 ${
									timeLeft <= 0
										? "opacity-50 cursor-not-allowed hover:scale-100"
										: ""
								}`}>
								{timeLeft <= 0 ? "Rate Expired" : "Proceed with Payment"}
							</button>
						</div>

						{/* Rate Protection Info */}
						<div className="bg-white/40 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-white/60">
							<h4 className="font-black text-xs sm:text-sm mb-2 uppercase text-[#2E7D32]">
								Rate Protection Active
							</h4>
							<p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
								Your exchange rate of{" "}
								<span className="font-bold">₦{lockData.rate}</span> is protected
								until the timer hits zero. Even if the market spikes, your cost
								remains unchanged for this transaction.
							</p>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}

function PreviewRow({
	label,
	value,
	isTotal = false,
}: {
	label: string;
	value: string;
	isTotal?: boolean;
}) {
	return (
		<div
			className={`flex justify-between items-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border transition-all ${
				isTotal
					? "bg-[#34A853] border-[#2E7D32]"
					: "bg-white border-white hover:shadow-md"
			}`}>
			<span
				className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
					isTotal ? "text-green-100" : "text-gray-400"
				}`}>
				{label}
			</span>
			<span
				className={`font-black ${
					isTotal
						? "text-xl sm:text-2xl text-white"
						: "text-base sm:text-lg md:text-xl text-[#1A1A1A]"
				}`}>
				{value}
			</span>
		</div>
	);
}
