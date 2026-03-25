"use client";
import Sidebar from "@/components/Sidebar";
import { ArrowUpRight, Download, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Transaction {
	_id: string;
	txnId: string;
	recipient: string;
	amountNgn: number;
	amountUsd: number;
	status: string;
	createdAt: string;
}

export default function HistoryPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const res = await fetch("/api/transactions/history");
				if (!res.ok) throw new Error("Failed to fetch");
				const data = await res.json();
				setTransactions(data);
			} catch (err) {
				toast.error("Could not load transaction history");
			} finally {
				setLoading(false);
			}
		};
		fetchHistory();
	}, []);

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="history" />

			<main className="flex-1 p-8 lg:p-12">
				<header className="flex justify-between items-end mb-10">
					<div>
						<h1 className="text-3xl font-black text-[#1A1A1A]">
							Transaction History
						</h1>
						<p className="text-gray-500 font-medium">
							Monitor and manage your FX conversions.
						</p>
					</div>
					<button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
						<Download size={18} /> Export CSV
					</button>
				</header>

				{/* Filters & Search */}
				<div className="flex gap-4 mb-8">
					<div className="relative flex-1">
						<Search
							className="absolute left-4 top-3.5 text-gray-400"
							size={20}
						/>
						<input
							type="text"
							placeholder="Search by Transaction ID or Recipient..."
							className="w-full pl-12 pr-4 py-3 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-[#34A853]/10 focus:border-[#34A853] transition"
						/>
					</div>
					<button className="flex items-center gap-2 bg-white border px-6 rounded-2xl font-bold text-gray-600">
						<Filter size={18} /> Filter
					</button>
				</div>

				{/* Table Container */}
				<div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-gray-50/50 border-b border-gray-100">
								<th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Transaction
								</th>
								<th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Recipient
								</th>
								<th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Date
								</th>
								<th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Amount (NGN)
								</th>
								<th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Amount (USD)
								</th>
								<th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{loading ? (
								[...Array(5)].map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={6} className="px-8 py-6">
											<div className="h-4 bg-gray-100 rounded w-full"></div>
										</td>
									</tr>
								))
							) : transactions.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="px-8 py-20 text-center text-gray-400 font-medium">
										No transactions found. Start by converting currency!
									</td>
								</tr>
							) : (
								transactions.map((txn) => (
									<tr
										key={txn._id}
										className="hover:bg-gray-50/80 transition-colors group">
										<td className="px-8 py-6">
											<div className="flex items-center gap-3">
												<div className="bg-[#E8F5E9] p-2 rounded-lg text-[#34A853]">
													<ArrowUpRight size={18} />
												</div>
												<span className="font-bold text-[#1A1A1A]">
													{txn.txnId}
												</span>
											</div>
										</td>
										<td className="px-8 py-6">
											<p className="font-bold text-sm text-[#1A1A1A]">
												{txn.recipient}
											</p>
											<p className="text-xs text-gray-400">
												Interbank Transfer
											</p>
										</td>
										<td className="px-8 py-6 text-sm text-gray-500 font-medium">
											{new Date(txn.createdAt).toLocaleDateString("en-GB", {
												day: "2-digit",
												month: "short",
												year: "numeric",
											})}
										</td>
										<td className="px-8 py-6 font-black text-sm">
											₦{txn.amountNgn.toLocaleString()}
										</td>
										<td className="px-8 py-6 font-black text-sm text-[#34A853]">
											$
											{txn.amountUsd.toLocaleString(undefined, {
												minimumFractionDigits: 2,
											})}
										</td>
										<td className="px-8 py-6">
											<span
												className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${txn.status === "Completed" ? "bg-[#E8F5E9] text-[#34A853]" : "bg-amber-50 text-amber-600"}
                      `}>
												{txn.status}
											</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Footer */}
				<div className="mt-8 flex justify-between items-center px-4">
					<p className="text-sm text-gray-500 font-medium">
						Showing {transactions.length} transactions
					</p>
					<div className="flex gap-2">
						<button
							className="px-4 py-2 border rounded-xl bg-white text-sm font-bold text-gray-400"
							disabled>
							Previous
						</button>
						<button className="px-4 py-2 border rounded-xl bg-white text-sm font-bold text-[#34A853]">
							Next
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
