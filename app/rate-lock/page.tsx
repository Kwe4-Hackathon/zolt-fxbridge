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
			<div className="h-screen flex items-center justify-center font-bold">
				Checking Rate Status...
			</div>
		);
	if (!lockData) return null;

	// Calculation constants
	const FEE = 12000;
	const usdEquivalent = (lockData.amountNgn - FEE) / lockData.rate;
	const totalDebit = lockData.amountNgn;

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="rate-lock" />

			<main className="flex-1 p-12">
				<div className="max-w-4xl mx-auto text-center mb-12">
					<p className="text-gray-400 font-black mb-2 uppercase text-[10px] tracking-widest">
						Your Secured Rate
					</p>
					<div className="bg-[#E1F5FE] border-2 border-[#B3E5FC] inline-block px-12 py-4 rounded-[20px] font-black text-2xl mb-4 text-[#01579B]">
						1 USD = ₦{lockData.rate.toLocaleString()}
					</div>
					<div className="text-gray-500 font-bold flex items-center justify-center gap-2">
						Lock Expires In:
						<span
							className={`font-black ${timeLeft < 3600 ? "text-red-500" : "text-[#34A853]"}`}>
							{formatTime(timeLeft)}
						</span>
					</div>
				</div>

				<section className="bg-[#E8F5E9] rounded-[40px] p-12 shadow-sm border border-white/50">
					<h2 className="text-xl font-black mb-8 uppercase tracking-tight">
						Transfer Preview
					</h2>

					<div className="space-y-4 mb-10">
						<PreviewRow
							label="YOU SENT"
							value={`₦${(lockData.amountNgn - FEE).toLocaleString()}`}
						/>
						<PreviewRow
							label="SUPPLIER RECEIVES"
							value={`$${usdEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

					<div className="flex justify-center mb-12">
						<button
							onClick={() => router.push("/transfer")}
							className="bg-[#34A853] text-white px-16 py-5 rounded-[22px] font-black text-lg hover:scale-105 transition shadow-xl shadow-green-100 active:scale-95">
							Proceed with Payment
						</button>
					</div>

					<div className="bg-white/40 p-6 rounded-2xl border border-white/60">
						<h4 className="font-black text-sm mb-2 uppercase text-[#2E7D32]">
							Rate Protection Active
						</h4>
						<p className="text-sm text-gray-600 font-medium leading-relaxed">
							Your exchange rate of{" "}
							<span className="font-bold">₦{lockData.rate}</span> is protected
							until the timer hits zero. Even if the market spikes, your cost
							remains unchanged for this transaction.
						</p>
					</div>
				</section>
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
			className={`flex justify-between items-center p-6 rounded-2xl shadow-sm border ${isTotal ? "bg-[#34A853] border-[#2E7D32]" : "bg-white border-white"}`}>
			<span
				className={`text-[10px] font-black uppercase tracking-widest ${isTotal ? "text-green-100" : "text-gray-400"}`}>
				{label}
			</span>
			<span
				className={`font-black ${isTotal ? "text-2xl text-white" : "text-lg text-[#1A1A1A]"}`}>
				{value}
			</span>
		</div>
	);
}
