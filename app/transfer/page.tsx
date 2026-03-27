// app/transfer/page.tsx (Client component)
"use client";
import ConfirmModal from "@/components/ConfirmModal";
import Sidebar from "@/components/Sidebar";
import { getAllBankNames, getBankCode } from "@/lib/bankCode";
import { UserLockedRate } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// Bank type for client
interface Bank {
	code: string;
	name: string;
}

export default function SupplierTransfer() {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	// State for lock data
	const [lockData, setLockData] = useState<UserLockedRate | null>(null);

	// State for banks list
	const [banks, setBanks] = useState<Bank[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showBankDropdown, setShowBankDropdown] = useState(false);

	// State for account validation
	const [accountValid, setAccountValid] = useState<boolean | null>(null);
	const [accountHolderName, setAccountHolderName] = useState<string>("");
	const [isValidating, setIsValidating] = useState(false);

	// Form data
	const [formData, setFormData] = useState({
		bank: "",
		bankCode: "",
		account: "",
		name: "",
		desc: "",
	});

	// Fetch locked rate
	useEffect(() => {
		const fetchLock = async () => {
			try {
				const res = await fetch("/api/user/wallet");
				const data = await res.json();
				if (data.lockedRate) {
					setLockData(data.lockedRate);
				} else {
					toast.error("No active rate lock found. Redirecting...");
					router.push("/convert");
				}
			} catch (error) {
				console.error("Error fetching lock:", error);
				toast.error("Failed to load data");
			}
		};
		fetchLock();
	}, [router]);

	// Load banks on mount
	useEffect(() => {
		const loadBanks = () => {
			const allBankNames = getAllBankNames();
			const bankList = allBankNames.map((bankName) => ({
				name: bankName,
				code: getBankCode(bankName),
			}));
			setBanks(bankList);
		};
		loadBanks();
	}, []);

	// Filter banks based on search
	const filteredBanks = useMemo(() => {
		if (!searchTerm) return banks.slice(0, 10);
		return banks
			.filter((bank) =>
				bank.name.toLowerCase().includes(searchTerm.toLowerCase()),
			)
			.slice(0, 10);
	}, [banks, searchTerm]);

	// Validate account number
	const validateAccountNumber = async (
		accountNumber: string,
		bankCode: string,
	) => {
		if (!accountNumber || accountNumber.length !== 10) {
			setAccountValid(false);
			setAccountHolderName("");
			return;
		}

		if (!bankCode) {
			setAccountValid(null);
			return;
		}

		setIsValidating(true);
		try {
			const response = await fetch("/api/banks/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountNumber,
					bankCode,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setAccountValid(true);
				setAccountHolderName(data.accountName);
				if (!formData.name) {
					setFormData((prev) => ({ ...prev, name: data.accountName }));
				}
				toast.success("Account validated successfully");
			} else {
				setAccountValid(false);
				setAccountHolderName("");
				toast.error(data.error || "Invalid account number");
			}
		} catch (error) {
			console.error("Validation error:", error);
			setAccountValid(false);
			toast.error("Failed to validate account");
		} finally {
			setIsValidating(false);
		}
	};

	const handleBankSelect = (bank: Bank) => {
		setFormData({
			...formData,
			bank: bank.name,
			bankCode: bank.code,
		});
		setSearchTerm(bank.name);
		setShowBankDropdown(false);
		setAccountValid(null);
		setAccountHolderName("");
	};

	const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 10);
		setFormData({ ...formData, account: value });
		setAccountValid(null);
		setAccountHolderName("");

		if (value.length === 10 && formData.bankCode) {
			validateAccountNumber(value, formData.bankCode);
		}
	};

	const handleSend = () => {
		if (!formData.bank) {
			toast.error("Please select a bank");
			return;
		}
		if (!formData.account || formData.account.length !== 10) {
			toast.error("Please enter a valid 10-digit account number");
			return;
		}
		if (!formData.name) {
			toast.error("Please enter supplier name");
			return;
		}
		if (!accountValid) {
			toast.error("Please verify account details");
			return;
		}

		setIsModalOpen(true);
	};

	const executePayment = async () => {
		setIsPending(true);
		try {
			const res = await fetch("/api/transactions/transfer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					beneficiary: {
						name: formData.name,
						bankName: formData.bank,
						bankCode: formData.bankCode,
						accountNumber: formData.account,
						narration: formData.desc,
					},
					amountNgn: lockData?.amountNgn,
				}),
			});

			const result = await res.json();

			if (res.ok) {
				toast.success("Transfer Successful!");
				router.push(`/transfer/success?txnId=${result.txnId}`);
			} else {
				toast.error(result.error || "Transfer failed");
				setIsModalOpen(false);
			}
		} catch (error) {
			console.error("Transfer error:", error);
			toast.error("Network error. Please try again.");
			setIsModalOpen(false);
		} finally {
			setIsPending(false);
		}
	};

	if (!lockData) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34A853] mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	const usdSent = (lockData.amountNgn - 12000) / lockData.rate;
	const expiresAt = new Date(lockData.expiresAt);
	const isExpiringSoon = expiresAt.getTime() - Date.now() < 5 * 60 * 1000;

	return (
		<div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
			<Sidebar active="transfer" />
			<main className="flex-1 overflow-y-auto p-12">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-2xl font-black mb-6">Supplier Details</h2>

					{/* Form fields */}
					<div className="space-y-4 mb-8">
						{/* Bank Selection */}
						<div className="relative">
							<input
								className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
								placeholder="Search for your bank..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setShowBankDropdown(true);
									if (!e.target.value) {
										setFormData({ ...formData, bank: "", bankCode: "" });
									}
								}}
								onFocus={() => setShowBankDropdown(true)}
							/>
							{showBankDropdown && filteredBanks.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
									{filteredBanks.map((bank, index) => (
										<button
											key={index}
											className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
											onClick={() => handleBankSelect(bank)}>
											<div className="font-medium">{bank.name}</div>
											<div className="text-xs text-gray-500">
												Code: {bank.code}
											</div>
										</button>
									))}
								</div>
							)}
						</div>

						{/* Account Number */}
						<div>
							<div className="relative">
								<input
									className={`w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20 ${
										accountValid === true ? "border-green-500 pr-12" : ""
									} ${accountValid === false ? "border-red-500" : ""}`}
									placeholder="Enter 10-digit account number"
									value={formData.account}
									onChange={handleAccountChange}
									maxLength={10}
								/>
								{isValidating && (
									<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#34A853]"></div>
									</div>
								)}
								{accountValid === true && !isValidating && (
									<div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
										✓
									</div>
								)}
							</div>
							{accountHolderName && (
								<div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
									<p className="text-sm text-green-800">
										<span className="font-semibold">Account Name:</span>{" "}
										{accountHolderName}
									</p>
								</div>
							)}
						</div>

						{/* Supplier Name */}
						<input
							className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
							placeholder="Enter Supplier Name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
						/>

						{/* Description */}
						<input
							className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#34A853]/20"
							placeholder="Enter Payment Description"
							value={formData.desc}
							onChange={(e) =>
								setFormData({ ...formData, desc: e.target.value })
							}
						/>
					</div>

					{/* Transfer Summary */}
					<section className="bg-[#E8F5E9] rounded-3xl p-8">
						<h3 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-500">
							Transfer Summary
						</h3>
						<div className="space-y-3 mb-8">
							<SummaryLine
								label="Amount"
								value={`₦${lockData.amountNgn.toLocaleString()}`}
							/>
							<SummaryLine label="Service Fee" value="₦12,000" />
							<SummaryLine
								label="Locked Rate"
								value={`₦${lockData.rate} = $1 USD`}
							/>
							<SummaryLine
								label="Supplier Receives"
								value={`$${usdSent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
							/>
							{isExpiringSoon && (
								<SummaryLine
									label="Rate Expires"
									value={expiresAt.toLocaleTimeString()}
									valueClassName="text-orange-600"
								/>
							)}
						</div>
						<div className="flex justify-center">
							<button
								onClick={handleSend}
								disabled={
									!formData.bank ||
									!formData.account ||
									!formData.name ||
									!accountValid
								}
								className={`bg-[#34A853] text-white px-16 py-4 rounded-xl font-bold hover:bg-[#2d9147] transition shadow-lg shadow-green-100 ${
									!formData.bank ||
									!formData.account ||
									!formData.name ||
									!accountValid
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}>
								Send Payment
							</button>
						</div>
					</section>

					<ConfirmModal
						isOpen={isModalOpen}
						onCancel={() => setIsModalOpen(false)}
						onConfirm={executePayment}
						isLoading={isPending}
					/>
				</div>
			</main>
		</div>
	);
}

function SummaryLine({
	label,
	value,
	valueClassName = "",
}: {
	label: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<div className="flex justify-between bg-white p-4 rounded-xl shadow-sm">
			<span className="text-gray-400 text-sm uppercase font-bold">{label}</span>
			<span className={`font-bold ${valueClassName}`}>{value}</span>
		</div>
	);
}
