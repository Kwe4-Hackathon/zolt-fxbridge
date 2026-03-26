"use client";
import Sidebar from "@/components/Sidebar";
import {
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Download,
	Filter,
	Search,
} from "lucide-react";
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
	bankName?: string;
	accountNumber?: string;
}

export default function HistoryPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [filteredTransactions, setFilteredTransactions] = useState<
		Transaction[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const res = await fetch("/api/transactions/history");
				if (!res.ok) throw new Error("Failed to fetch");
				const data = await res.json();
				console.log("data", data);
				setTransactions(data);
				setFilteredTransactions(data);
			} catch (err) {
				toast.error("Could not load transaction history");
			} finally {
				setLoading(false);
			}
		};
		fetchHistory();
	}, []);

	// Handle search
	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredTransactions(transactions);
		} else {
			const filtered = transactions.filter(
				(tx) =>
					tx.txnId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					tx.recipient?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			setFilteredTransactions(filtered);
		}
		setCurrentPage(1);
	}, [searchTerm, transactions]);

	// Pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentTransactions = filteredTransactions.slice(
		indexOfFirstItem,
		indexOfLastItem,
	);
	const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
		} else if (diffDays === 1) {
			return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
		} else {
			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			});
		}
	};

	// Export to CSV
	const exportToCSV = () => {
		const headers = [
			"Transaction ID",
			"Recipient",
			"Date",
			"Amount (NGN)",
			"Amount (USD)",
			"Status",
		];
		const csvData = filteredTransactions.map((tx) => [
			tx.txnId,
			tx.recipient,
			new Date(tx.createdAt).toLocaleDateString(),
			tx.amountNgn,
			tx.amountUsd,
			tx.status,
		]);

		const csvContent = [headers, ...csvData]
			.map((row) => row.join(","))
			.join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
		toast.success("Export started");
	};

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="history" />

			<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden">
				{/* Header - Responsive */}
				<header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8 md:mb-10">
					<div>
						<h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
							Transaction History
						</h1>
						<p className="text-sm sm:text-base text-gray-500 font-medium">
							Monitor and manage your FX conversions
						</p>
					</div>
					<button
						onClick={exportToCSV}
						className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition w-full sm:w-auto justify-center">
						<Download size={18} /> Export CSV
					</button>
				</header>

				{/* Filters & Search - Responsive */}
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
					<div className="relative flex-1">
						<Search
							className="absolute left-3 sm:left-4 top-3 text-gray-400"
							size={18}
						/>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by Transaction ID or Recipient..."
							className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-[#34A853]/10 focus:border-[#34A853] transition text-sm sm:text-base"
						/>
					</div>
					<button className="flex items-center justify-center gap-2 bg-white border px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-gray-600 text-sm sm:text-base">
						<Filter size={16} /> Filter
					</button>
				</div>

				{/* Mobile Cards View */}
				<div className="md:hidden space-y-3 mb-6">
					{loading ? (
						[...Array(3)].map((_, i) => (
							<div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
								<div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
								<div className="h-3 bg-gray-100 rounded w-1/2"></div>
							</div>
						))
					) : currentTransactions.length === 0 ? (
						<div className="bg-white rounded-2xl p-8 text-center">
							<p className="text-gray-400 font-medium">No transactions found</p>
							<p className="text-sm text-gray-300 mt-1">
								Start by converting currency!
							</p>
						</div>
					) : (
						currentTransactions.map((txn) => (
							<div
								key={txn._id}
								className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
								<div className="flex justify-between items-start mb-3">
									<div className="flex items-center gap-2">
										<div className="bg-[#E8F5E9] p-2 rounded-lg">
											<ArrowUpRight size={14} className="text-[#34A853]" />
										</div>
										<div>
											<p className="font-bold text-sm">{txn.txnId}</p>
											<p className="text-xs text-gray-400">
												{formatDate(txn.createdAt)}
											</p>
										</div>
									</div>
									<span
										className={`
											px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
											${txn.status === "Completed" ? "bg-[#E8F5E9] text-[#34A853]" : "bg-amber-50 text-amber-600"}
										`}>
										{txn.status}
									</span>
								</div>

								<div className="border-t border-gray-50 pt-3 space-y-2">
									<div className="flex justify-between">
										<span className="text-xs text-gray-400">Recipient</span>
										<span className="text-sm font-medium text-right">
											{txn.recipient}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-xs text-gray-400">Amount (NGN)</span>
										<span className="text-sm font-bold">
											₦{txn.amountNgn.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-xs text-gray-400">Amount (USD)</span>
										<span className="text-sm font-bold text-[#34A853]">
											$
											{txn.amountUsd.toLocaleString(undefined, {
												minimumFractionDigits: 2,
											})}
										</span>
									</div>
									{txn.bankName && (
										<div className="flex justify-between">
											<span className="text-xs text-gray-400">Bank</span>
											<span className="text-xs text-gray-600">
												{txn.bankName}
											</span>
										</div>
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* Desktop Table View */}
				<div className="hidden md:block bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-x-auto">
					<table className="w-full text-left min-w-[800px]">
						<thead>
							<tr className="bg-gray-50/50 border-b border-gray-100">
								<th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Transaction
								</th>
								<th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Recipient
								</th>
								<th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Date
								</th>
								<th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Amount (NGN)
								</th>
								<th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
									Amount (USD)
								</th>
								<th className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
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
							) : currentTransactions.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="px-8 py-20 text-center text-gray-400 font-medium">
										No transactions found. Start by converting currency!
									</td>
								</tr>
							) : (
								currentTransactions.map((txn) => (
									<tr
										key={txn._id}
										className="hover:bg-gray-50/80 transition-colors group">
										<td className="px-6 lg:px-8 py-5 lg:py-6">
											<div className="flex items-center gap-3">
												<div className="bg-[#E8F5E9] p-2 rounded-lg text-[#34A853]">
													<ArrowUpRight size={16} />
												</div>
												<span className="font-bold text-sm text-[#1A1A1A]">
													{txn.txnId}
												</span>
											</div>
										</td>
										<td className="px-6 lg:px-8 py-5 lg:py-6">
											<p className="font-bold text-sm text-[#1A1A1A]">
												{txn.recipient}
											</p>
											{txn.bankName && (
												<p className="text-xs text-gray-400">{txn.bankName}</p>
											)}
										</td>
										<td className="px-6 lg:px-8 py-5 lg:py-6 text-sm text-gray-500 font-medium">
											{formatDate(txn.createdAt)}
										</td>
										<td className="px-6 lg:px-8 py-5 lg:py-6 font-black text-sm">
											₦{txn.amountNgn.toLocaleString()}
										</td>
										<td className="px-6 lg:px-8 py-5 lg:py-6 font-black text-sm text-[#34A853]">
											$
											{txn.amountUsd.toLocaleString(undefined, {
												minimumFractionDigits: 2,
											})}
										</td>
										<td className="px-6 lg:px-8 py-5 lg:py-6">
											<span
												className={`
													px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
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

				{/* Pagination Footer - Responsive */}
				{filteredTransactions.length > 0 && (
					<div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 px-2 sm:px-4">
						<p className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
							Showing {indexOfFirstItem + 1} to{" "}
							{Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
							{filteredTransactions.length} transactions
						</p>
						<div className="flex gap-2 order-1 sm:order-2">
							<button
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-xl bg-white text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
								<ChevronLeft size={16} />
								<span className="hidden sm:inline">Previous</span>
							</button>
							<div className="flex gap-1 sm:gap-2">
								{[...Array(Math.min(5, totalPages))].map((_, i) => {
									let pageNum;
									if (totalPages <= 5) {
										pageNum = i + 1;
									} else if (currentPage <= 3) {
										pageNum = i + 1;
									} else if (currentPage >= totalPages - 2) {
										pageNum = totalPages - 4 + i;
									} else {
										pageNum = currentPage - 2 + i;
									}

									return (
										<button
											key={i}
											onClick={() => setCurrentPage(pageNum)}
											className={`
												w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition
												${
													currentPage === pageNum
														? "bg-[#34A853] text-white"
														: "bg-white border text-gray-600 hover:bg-gray-50"
												}
											`}>
											{pageNum}
										</button>
									);
								})}
							</div>
							<button
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
								className="flex items-center gap-1 px-3 sm:px-4 py-2 border rounded-xl bg-white text-sm font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
								<span className="hidden sm:inline">Next</span>
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
