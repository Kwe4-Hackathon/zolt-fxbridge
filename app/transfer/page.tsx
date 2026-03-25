"use client";
import ConfirmModal from "@/components/ConfirmModal";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SupplierTransfer() {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	// State to hold the data we get from the DB
	const [lockData, setLockData] = useState<any>(null);

	const [formData, setFormData] = useState({
		bank: "Bank of China",
		account: "012-875-13625176",
		name: "SHENZHEN ELECTRONICS LTD.",
		desc: "Invoice payment - Electronic parts",
	});

	// 1. Fetch the locked rate when the page opens
	useEffect(() => {
		const fetchLock = async () => {
			const res = await fetch("/api/user/wallet");
			const data = await res.json();
			if (data.lockedRate) {
				setLockData(data.lockedRate);
			} else {
				toast.error("No active rate lock found. Redirecting...");
				router.push("/convert");
			}
		};
		fetchLock();
	}, [router]);

	const handleSend = () => {
		setIsModalOpen(true);
	};

	// 2. Execute the payment via the API
	const executePayment = async () => {
		setIsPending(true);
		try {
			const res = await fetch("/api/transactions/transfer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					beneficiary: {
						name: formData.name,
						bank: formData.bank,
						account: formData.account,
					},
					amountNgn: lockData.amountNgn,
				}),
			});

			const result = await res.json();

			if (res.ok) {
				toast.success("Transfer Successful!");
				// Pass transaction details to the success page via query params or state
				router.push(`/transfer/success?txnId=${result.txnId}`);
			} else {
				toast.error(result.error || "Transfer failed");
				setIsModalOpen(false);
			}
		} catch (error) {
			toast.error("Network error. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	if (!lockData)
		return (
			<div className="flex h-screen items-center justify-center font-bold">
				Validating Rate Lock...
			</div>
		);

	const usdSent = (lockData.amountNgn - 12000) / lockData.rate;

	return (
		<div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
			<Sidebar active="transfer" />
			<main className="flex-1 overflow-y-auto p-12">
				<h2 className="text-xl font-black mb-6">Supplier Details</h2>

				<div className="space-y-4 mb-8">
					<input
						className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
						placeholder="Enter Bank Name"
						value={formData.bank}
						onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
					/>
					<input
						className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
						placeholder="Enter Account Number"
						value={formData.account}
						onChange={(e) =>
							setFormData({ ...formData, account: e.target.value })
						}
					/>
					<input
						className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
						placeholder="Enter Supplier Name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					/>
					<input
						className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
						placeholder="Enter Payment Description"
						value={formData.desc}
						onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
					/>
				</div>

				<section className="bg-[#E8F5E9] rounded-3xl p-8">
					<h3 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-500">
						Transfer Summary
					</h3>
					<div className="space-y-3 mb-8">
						<SummaryLine
							label="Amount"
							value={`₦${lockData?.amountNgn?.toLocaleString()}`}
						/>
						<SummaryLine
							label="Supplier Receives"
							value={`$${usdSent?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
						/>
						<SummaryLine
							label="Locked Rate"
							value={`${lockData?.rate} NGN = 1 USD`}
						/>
						<SummaryLine label="Fees" value="₦12,000" />
					</div>
					<div className="flex justify-center">
						<button
							onClick={handleSend}
							className="bg-[#34A853] text-white px-16 py-4 rounded-xl font-bold hover:bg-[#2d9147] transition shadow-lg shadow-green-100">
							Send Payment
						</button>
					</div>
				</section>

				<ConfirmModal
					isOpen={isModalOpen}
					onCancel={() => setIsModalOpen(false)}
					onConfirm={executePayment}
					isLoading={isPending} // Ensure your Modal handles a loading state!
				/>
			</main>
		</div>
	);
}

function SummaryLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between bg-white p-4 rounded-xl shadow-sm">
			<span className="text-gray-400 text-sm uppercase font-bold">{label}</span>
			<span className="font-bold">{value}</span>
		</div>
	);
}
