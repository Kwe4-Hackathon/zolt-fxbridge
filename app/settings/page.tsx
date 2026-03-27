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

	// Load Paystack script
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
			// Generate unique reference
			const reference = `ZLT-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

			// Store reference for verification
			localStorage.setItem(
				"pending_topup",
				JSON.stringify({
					reference: reference,
					amount: amount,
					timestamp: Date.now(),
				}),
			);

			// Configure Paystack - using the exact format Paystack expects
			const config = {
				key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
				email: session?.user?.email,
				amount: amount * 100, // Convert to kobo
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
				<main className="flex-1 p-12 flex items-center justify-center">
					<Loader2 className="w-8 h-8 animate-spin text-[#34A853]" />
				</main>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-[#F8F9FA]">
			<Sidebar active="settings" />
			<main className="flex-1 p-12 overflow-y-auto">
				<header className="mb-10">
					<h1 className="text-3xl font-black text-[#1A1A1A]">Settings</h1>
					<p className="text-gray-500 font-medium">
						Manage your wallet and account security.
					</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
							<div className="flex justify-between items-center mb-8">
								<div className="flex items-center gap-4">
									<div className="bg-[#E8F5E9] p-3 rounded-2xl">
										<Wallet className="text-[#34A853]" />
									</div>
									<div>
										<h2 className="font-black text-xl">Zolt Wallet</h2>
										<p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
											Naira Account
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-3xl font-black">
										₦{balance.toLocaleString()}
									</p>
									<span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">
										Active
									</span>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
									<label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">
										Amount to Fund (NGN)
									</label>
									<input
										type="number"
										placeholder="Minimum ₦100"
										value={topupAmount}
										onChange={(e) => setTopupAmount(e.target.value)}
										className="bg-transparent text-2xl font-black outline-none w-full"
										min="100"
										max="1000000"
										step="100"
										disabled={isFunding}
									/>
									<p className="text-xs text-gray-400 mt-1">
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
									className="bg-[#1A1A1A] text-white px-8 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:bg-gray-300">
									{isFunding ? (
										<Loader2 size={20} className="animate-spin" />
									) : (
										<Plus size={20} />
									)}
									{isFunding ? "Processing..." : "Top Up"}
								</button>
							</div>

							{!paystackLoaded && (
								<div className="mt-4 p-3 bg-yellow-50 rounded-xl flex items-start gap-2">
									<Loader2
										size={16}
										className="animate-spin text-yellow-600 mt-0.5"
									/>
									<p className="text-xs text-yellow-800">
										Loading payment service...
									</p>
								</div>
							)}

							<div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
								<AlertCircle size={16} className="text-blue-600 mt-0.5" />
								<p className="text-xs text-blue-800">
									Complete your payment securely with Paystack. Multiple payment
									options available.
								</p>
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<div className="bg-gradient-to-br from-[#00425F] to-[#003349] text-white p-8 rounded-[32px] relative overflow-hidden">
							<ShieldCheck className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
							<h3 className="font-black text-lg mb-2">Paystack Secured</h3>
							<p className="text-sm text-blue-100 mb-6">
								Your funds are protected by Paystack's enterprise-grade
								security.
							</p>
							<div className="flex flex-col gap-2 text-xs font-bold uppercase tracking-tighter">
								<div className="flex items-center gap-2">
									<CreditCard size={14} />
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
