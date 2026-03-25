"use client";
import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

function SuccessContent() {
	const searchParams = useSearchParams();
	const txnId = searchParams.get("txnId");
	const [details, setDetails] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTxnDetails = async () => {
			if (!txnId) return;
			try {
				// We'll create this specific endpoint to get a single txn
				const res = await fetch(`/api/transactions/details?txnId=${txnId}`);
				const data = await res.json();
				if (res.ok) {
					setDetails(data);
				} else {
					toast.error("Receipt details not found");
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchTxnDetails();
	}, [txnId]);

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center font-bold">
				Generating Receipt...
			</div>
		);
	if (!details)
		return (
			<div className="min-h-screen flex items-center justify-center">
				Transaction not found.
			</div>
		);

	return (
		<div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
			<div className="bg-[#E8F5E9] p-2 px-6 rounded-lg text-[#34A853] font-black mb-8 flex items-center gap-2 animate-bounce">
				<div className="bg-[#34A853] text-white rounded-full p-1">
					<Check size={16} strokeWidth={4} />
				</div>
				PAYMENT SIMULATION COMPLETED!!
			</div>

			<div className="bg-[#E8F5E9] w-full max-w-4xl rounded-[40px] p-10 shadow-sm">
				<div className="mb-10 border-b border-white/40 pb-8">
					<p className="text-gray-400 text-xs font-black uppercase mb-4 tracking-widest">
						Recipient Details
					</p>
					<h2 className="text-3xl font-black mb-1 uppercase tracking-tight text-[#1A1A1A]">
						{details.recipient}
					</h2>
					<h3 className="text-xl font-bold text-gray-600 mb-4">
						{details.bankName}
					</h3>
					<p className="text-lg font-mono font-bold text-gray-500">
						****{details.accountNumber?.slice(-4) || "4832"}
					</p>
					<div className="mt-6 inline-block bg-white/50 px-4 py-2 rounded-xl">
						<p className="text-[10px] text-gray-400 font-bold uppercase">
							Transaction ID
						</p>
						<p className="font-black text-[#1A1A1A]">{details.txnId}</p>
					</div>
				</div>

				<div className="space-y-3">
					<h4 className="font-black text-sm uppercase text-gray-400 mb-4 tracking-widest">
						Transfer Summary
					</h4>
					<SummaryRow
						label="NGN DEBITED"
						value={`₦${details.amountNgn.toLocaleString()}`}
					/>
					<SummaryRow
						label="USD SENT"
						value={`$${details.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
					/>
					<SummaryRow
						label="EXCHANGE RATE"
						value={`${details.rate} NGN = 1 USD`}
					/>
					<SummaryRow label="FEES" value="₦12,000" />
				</div>

				<div className="flex gap-4 mt-10">
					<Link href="/transfer" className="flex-1">
						<button className="w-full bg-[#34A853] text-white py-5 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-[#2d9147] transition">
							New Transfer
						</button>
					</Link>
					<button
						onClick={() => window.print()}
						className="bg-white text-gray-700 px-8 rounded-2xl font-black border border-gray-200 hover:bg-gray-50 transition">
						Download PDF
					</button>
				</div>
			</div>

			<Link
				href="/dashboard"
				className="mt-8 text-gray-400 font-bold hover:text-[#34A853] transition">
				Back to Dashboard
			</Link>
		</div>
	);
}

// Wrapper to handle Next.js Suspense requirement for useSearchParams
export default function SuccessPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SuccessContent />
		</Suspense>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white">
			<span className="text-gray-400 text-xs font-black uppercase tracking-wider">
				{label}
			</span>
			<span className="font-black text-[#1A1A1A]">{value}</span>
		</div>
	);
}
