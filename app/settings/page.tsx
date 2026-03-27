"use client";
import Sidebar from "@/components/Sidebar";
import { CreditCard, Loader2, Plus, ShieldCheck, Wallet } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

declare global {
	interface Window {
		webpayCheckout: (params: any) => void;
	}
}

export default function SettingsPage() {
	const { data: session } = useSession();
	const [balance, setBalance] = useState(0);
	const [topupAmount, setTopupAmount] = useState("");
	const [isFunding, setIsFunding] = useState(false);
	const [loading, setLoading] = useState(true);

	// ✅ PROPER SCRIPT LOADER
	const loadInterswitchScript = () => {
		return new Promise<void>((resolve, reject) => {
			if (typeof window.webpayCheckout === "function") return resolve();

			const sources = [
				"https://webpay.interswitchng.com/inline-checkout.js",
				"https://newwebpay.interswitchng.com/inline-checkout.js",
			];

			let loaded = false;

			const loadScript = (index: number) => {
				if (index >= sources.length) {
					return reject(new Error("All Interswitch script sources failed"));
				}

				const script = document.createElement("script");
				script.src = sources[index];
				script.async = true;

				script.onload = () => {
					loaded = true;
					resolve();
				};

				script.onerror = () => {
					console.warn(`Failed loading: ${sources[index]}`);
					loadScript(index + 1);
				};

				document.body.appendChild(script);
			};

			loadScript(0);
		});
	};

	// Fetch balance
	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const res = await fetch("/api/user/balance");
				const data = await res.json();
				if (res.ok) setBalance(data.balance);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		if (session) fetchBalance();
	}, [session]);

	// ✅ FIXED TOPUP FUNCTION
	const handleTopUp = async () => {
		if (!topupAmount || parseFloat(topupAmount) <= 0) {
			return toast.error("Please enter a valid amount");
		}

		if (parseFloat(topupAmount) < 100) {
			return toast.error("Minimum top-up amount is ₦100");
		}

		setIsFunding(true);

		try {
			const res = await fetch("/api/user/wallet/topup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: parseFloat(topupAmount),
					email: session?.user?.email,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to initialize payment");
			}

			// ✅ Load script safely
			await loadInterswitchScript();

			// ✅ HARD CHECK
			if (typeof window.webpayCheckout !== "function") {
				throw new Error("Interswitch checkout failed to initialize");
			}

			// ✅ OPEN CHECKOUT
			window.webpayCheckout({
				merchant_code: data.merchantCode,
				pay_item_id: data.payItemId,
				txn_ref: data.txnRef,
				amount: data.amount,
				currency: data.currency,
				mode: "TEST",
				cust_email: session?.user?.email || "customer@zolt.com",
				cust_name: session?.user?.name || "Zolt Customer",
				site_redirect_url: `${window.location.origin}/settings?payment=success`,

				onComplete: async (response: any) => {
					console.log("Payment complete:", response);

					if (response.resp === "00") {
						const verifyRes = await fetch("/api/user/wallet/verify", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								txnRef: data.txnRef,
								amount: parseFloat(topupAmount),
							}),
						});

						const verifyData = await verifyRes.json();

						if (verifyRes.ok) {
							setBalance(verifyData.newBalance);
							toast.success(`₦${topupAmount} added to your wallet!`);
							setTopupAmount("");
						} else {
							toast.error("Payment verified but balance update failed");
						}
					} else {
						toast.error(response.desc || "Payment failed or cancelled");
					}

					setIsFunding(false);
				},
			});
		} catch (error: any) {
			console.error(error);
			toast.error(error.message || "Payment failed");
			setIsFunding(false);
		}
	};

	// UI untouched
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

			<main className="flex-1 p-12">
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
										step="100"
									/>
									<p className="text-xs text-gray-400 mt-1">
										Min: ₦100 | Powered by Interswitch
									</p>
								</div>

								<button
									onClick={handleTopUp}
									disabled={
										isFunding || !topupAmount || parseFloat(topupAmount) < 100
									}
									className="bg-[#1A1A1A] text-white px-8 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:bg-gray-300 disabled:cursor-not-allowed">
									{isFunding ? (
										<Loader2 size={20} className="animate-spin" />
									) : (
										<Plus size={20} />
									)}
									{isFunding ? "Processing..." : "Top Up"}
								</button>
							</div>
						</section>

						<section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
							<h2 className="font-black text-xl mb-6">Security Settings</h2>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
									<div className="flex items-center gap-3">
										<ShieldCheck className="text-[#34A853]" />
										<span className="font-bold text-gray-700">
											Two-Factor Authentication
										</span>
									</div>
									<div className="w-12 h-6 bg-[#34A853] rounded-full p-1 cursor-pointer">
										<div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
									</div>
								</div>
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<div className="bg-[#00425F] text-white p-8 rounded-[32px] relative overflow-hidden">
							<ShieldCheck className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
							<h3 className="font-black text-lg mb-2">Interswitch Verified</h3>
							<p className="text-sm text-blue-100 mb-6">
								Your funds are protected by Interswitch's multi-layer security
								protocols.
							</p>
							<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
								<CreditCard size={14} />
								PCI-DSS Compliant
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
