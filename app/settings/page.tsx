// app/settings/page.tsx
"use client";
import Sidebar from "@/components/Sidebar";
import {
	AlertCircle,
	CreditCard,
	Loader2,
	Plus,
	ShieldCheck,
	Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

declare global {
	interface Window {
		PaystackPop: any;
	}
}

export default function SettingsPage() {
	const { data: session, status } = useSession();
	const [balance, setBalance] = useState(0);
	const [topupAmount, setTopupAmount] = useState("");
	const [isFunding, setIsFunding] = useState(false);
	const [loading, setLoading] = useState(true);
	const [paystackLoaded, setPaystackLoaded] = useState(false);

	useEffect(() => {
		if (window.PaystackPop) {
			setPaystackLoaded(true);
			return;
		}

		const script = document.createElement("script");
		script.src = "https://js.paystack.co/v1/inline.js";
		script.async = true;
		script.onload = () => {
			console.log("Paystack script loaded");
			setPaystackLoaded(true);
		};
		script.onerror = () => {
			console.error("Failed to load Paystack script");
			toast.error("Payment service unavailable. Please refresh.");
		};
		document.body.appendChild(script);
	}, []);

	const fetchUserData = useCallback(async () => {
		if (status !== "authenticated") return;

		try {
			const balanceRes = await fetch("/api/user/balance");
			const balanceData = await balanceRes.json();
			if (balanceRes.ok) {
				setBalance(balanceData.balance);
			}
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setLoading(false);
		}
	}, [status]);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	const paymentCallback = (response: any) => {
		console.log("Payment callback received:", response);

		if (response.status === "success") {
			toast.loading("Verifying payment...", { id: "verify" });

			fetch("/api/user/wallet/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reference: response.reference }),
			})
				.then(async (res) => {
					const data = await res.json();
					toast.dismiss("verify");

					if (data.success) {
						setBalance(data.newBalance);
						toast.success(
							`₦${data.amount.toLocaleString()} added to your wallet!`,
						);
						fetchUserData();
						localStorage.removeItem("pending_topup");
					} else {
						toast.error(data.error || "Verification failed");
					}
				})
				.catch((error) => {
					toast.dismiss("verify");
					console.error("Verification error:", error);
					toast.error("Failed to verify payment");
				})
				.finally(() => {
					setIsFunding(false);
				});
		} else {
			toast.error("Payment was not successful");
			setIsFunding(false);
		}
	};

	const paymentClose = () => {
		console.log("Payment window closed");
		toast.error("Payment cancelled");
		setIsFunding(false);
	};

	const handleTopUp = async () => {
		if (!topupAmount || parseFloat(topupAmount) <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		const amount = parseFloat(topupAmount);
		if (amount < 100) {
			toast.error("Minimum top-up amount is ₦100");
			return;
		}

		if (!window.PaystackPop) {
			toast.error("Payment service is still loading. Please wait a moment.");
			return;
		}

		setIsFunding(true);

		try {
			const reference = `ZLT-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

			localStorage.setItem(
				"pending_topup",
				JSON.stringify({
					reference: reference,
					amount: amount,
					timestamp: Date.now(),
				}),
			);

			const config = {
				key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
				email: session?.user?.email,
				amount: amount * 100,
				ref: reference,
				currency: "NGN",
				callback: paymentCallback,
				onClose: paymentClose,
			};

			console.log("Opening Paystack with config:", {
				...config,
				key: "***hidden***",
			});

			// Open Paystack popup
			const handler = window.PaystackPop.setup(config);
			handler.openIframe();
		} catch (error: any) {
			console.error("Topup error:", error);
			toast.error(error.message || "Failed to initiate payment");
			setIsFunding(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen bg-[#F8F9FA]">
				<Sidebar active="settings" />
				<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center">
					<Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#34A853]" />
				</main>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="settings" />
			<main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
				<header className="mb-6 sm:mb-8 md:mb-10">
					<h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
						Settings
					</h1>
					<p className="text-sm sm:text-base text-gray-500 font-medium">
						Manage your wallet and account security.
					</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
					{/* Left Column - Wallet Section */}
					<div className="lg:col-span-2 space-y-6 sm:space-y-8">
						{/* Wallet Card */}
						<section className="bg-white p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] shadow-sm border border-gray-100">
							{/* Balance Header */}
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
								<div className="flex items-center gap-3 sm:gap-4">
									<div className="bg-[#E8F5E9] p-2 sm:p-3 rounded-xl sm:rounded-2xl">
										<Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#34A853]" />
									</div>
									<div>
										<h2 className="font-black text-lg sm:text-xl">
											Zolt Wallet
										</h2>
										<p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
											Naira Account
										</p>
									</div>
								</div>
								<div className="text-left sm:text-right w-full sm:w-auto">
									<p className="text-2xl sm:text-3xl font-black">
										₦{balance.toLocaleString()}
									</p>
									<span className="text-[10px] sm:text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">
										Active
									</span>
								</div>
							</div>

							{/* Top Up Section */}
							<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
								<div className="flex-1 bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-dashed border-gray-200">
									<label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-1 sm:mb-2 block">
										Amount to Fund (NGN)
									</label>
									<input
										type="number"
										placeholder="Minimum ₦100"
										value={topupAmount}
										onChange={(e) => setTopupAmount(e.target.value)}
										className="bg-transparent text-xl sm:text-2xl font-black outline-none w-full"
										min="100"
										max="1000000"
										step="100"
										disabled={isFunding}
									/>
									<p className="text-[10px] sm:text-xs text-gray-400 mt-1">
										Min: ₦100 | Max: ₦1,000,000 | Powered by Paystack
									</p>
								</div>
								<button
									onClick={handleTopUp}
									disabled={
										isFunding ||
										!topupAmount ||
										parseFloat(topupAmount) < 100 ||
										!paystackLoaded
									}
									className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:bg-gray-300 disabled:cursor-not-allowed">
									{isFunding ? (
										<Loader2 size={18} className="animate-spin" />
									) : (
										<Plus size={18} />
									)}
									<span className="text-sm sm:text-base">
										{isFunding ? "Processing..." : "Top Up"}
									</span>
								</button>
							</div>

							{/* Loading Indicator */}
							{!paystackLoaded && (
								<div className="mt-4 p-3 bg-yellow-50 rounded-xl flex items-start gap-2">
									<Loader2
										size={14}
										className="animate-spin text-yellow-600 mt-0.5"
									/>
									<p className="text-[11px] sm:text-xs text-yellow-800">
										Loading payment service...
									</p>
								</div>
							)}

							{/* Info Message */}
							<div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
								<AlertCircle
									size={14}
									className="text-blue-600 mt-0.5 flex-shrink-0"
								/>
								<p className="text-[11px] sm:text-xs text-blue-800 leading-relaxed">
									Complete your payment securely with Paystack. Multiple payment
									options available: Card, Transfer, USSD, Wallet.
								</p>
							</div>
						</section>

						{/* Security Section */}
						<section className="bg-white p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] shadow-sm border border-gray-100">
							<h2 className="font-black text-lg sm:text-xl mb-5 sm:mb-6">
								Security Settings
							</h2>
							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
									<div className="flex items-center gap-2 sm:gap-3">
										<ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#34A853]" />
										<span className="font-bold text-sm sm:text-base text-gray-700">
											Two-Factor Authentication
										</span>
									</div>
									<button className="w-10 h-5 sm:w-12 sm:h-6 bg-[#34A853] rounded-full p-0.5 sm:p-1 hover:bg-[#2d9147] transition-colors">
										<div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full ml-auto"></div>
									</button>
								</div>
							</div>
						</section>
					</div>

					{/* Right Column - Info Card */}
					<div className="space-y-6">
						<div className="bg-gradient-to-br from-[#00425F] to-[#003349] text-white p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] relative overflow-hidden">
							<ShieldCheck className="absolute -right-4 -bottom-4 text-white/10 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32" />
							<h3 className="font-black text-base sm:text-lg mb-2">
								Paystack Secured
							</h3>
							<p className="text-xs sm:text-sm text-blue-100 mb-4 sm:mb-6 leading-relaxed">
								Your funds are protected by Paystack's enterprise-grade security
								with PCI-DSS Level 1 compliance.
							</p>
							<div className="flex flex-col gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-tighter">
								<div className="flex items-center gap-2">
									<CreditCard size={12} className="sm:w-3.5 sm:h-3.5" />
									PCI-DSS Level 1 Compliant
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
