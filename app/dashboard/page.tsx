"use client";
import Sidebar from "@/components/Sidebar";
import {
	Bell,
	Eye,
	EyeOff,
	RefreshCcw,
	Search,
	TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export default function Dashboard() {
	const { data: session } = useSession();
	const [userData, setUserData] = useState({
		ngnBalance: 0,
		usdBalance: 0,
		name: "",
	});
	const [marketData, setMarketData] = useState<any[]>([]);
	const [showBalance, setShowBalance] = useState(true);
	const [loading, setLoading] = useState(true);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			// Fetch User Data from DB
			const userRes = await fetch("/api/user/data");
			const uData = await userRes.json();
			setUserData(uData);

			// Fetch/Generate Real-time Market Data
			// In a real app, replace this with: fetch('https://api.exchangerate-api.com/v4/latest/USD')
			const generatedData = Array.from({ length: 12 }, (_, i) => ({
				time: `${i * 2}:00`,
				rate: 1400 + Math.random() * 150,
				volume: Math.floor(Math.random() * 5000) + 1000,
			}));
			setMarketData(generatedData);
		} catch (error) {
			console.error("Dashboard Sync Error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session) fetchDashboardData();
	}, [session]);

	return (
		<div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
			<Sidebar active="dashboard" />

			<main className="flex-1 overflow-y-auto p-8">
				{/* Header */}
				<header className="flex justify-between items-center mb-8">
					<div className="relative w-1/3">
						<Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search transactions..."
							className="w-full pl-10 pr-4 py-3 border-none rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-[#34A853]/20 outline-none transition-all"
						/>
					</div>
					<div className="flex items-center gap-4">
						<button className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-[#34A853] transition">
							<Bell className="w-5 h-5" />
						</button>
						<div className="flex items-center gap-3 bg-white p-2 pr-5 rounded-2xl shadow-sm border border-gray-50">
							<div className="w-10 h-10 rounded-xl bg-[#34A853] flex items-center justify-center text-white font-black text-lg">
								{userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
							</div>
							<div>
								<p className="font-black text-sm text-[#1A1A1A]">
									{userData.name || "User"}
								</p>
								<p className="text-[10px] text-gray-400 font-black uppercase">
									Verified Merchant
								</p>
							</div>
						</div>
					</div>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left: Wallet & Actions */}
					<div className="lg:col-span-2 space-y-8">
						<section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
							<div className="flex justify-between items-center mb-8">
								<h2 className="text-xl font-black text-[#1A1A1A]">
									Wallet Overview
								</h2>
								<button
									onClick={fetchDashboardData}
									className="p-2 hover:bg-gray-50 rounded-lg transition">
									<RefreshCcw
										size={18}
										className={`${loading ? "animate-spin" : ""} text-gray-400`}
									/>
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<BalanceCard
									label="NGN Balance"
									amount={userData.ngnBalance}
									symbol="₦"
									show={showBalance}
									onToggle={() => setShowBalance(!showBalance)}
								/>
								<BalanceCard
									label="USD Balance"
									amount={userData.usdBalance}
									symbol="$"
									show={showBalance}
									onToggle={() => setShowBalance(!showBalance)}
								/>
							</div>

							<div className="flex gap-4 mt-10">
								<Link
									href="/convert"
									className="flex-1 bg-[#34A853] text-white py-4 rounded-2xl font-black text-center shadow-lg shadow-green-100 hover:bg-[#2d9147] transition">
									Convert FX
								</Link>
								<Link
									href="/transfer"
									className="flex-1 border-2 border-[#34A853] text-[#34A853] py-4 rounded-2xl font-black text-center hover:bg-gray-50 transition">
									Send Payment
								</Link>
							</div>
						</section>

						{/* Real-time Charts Section */}
						<section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="font-black text-lg text-[#1A1A1A] uppercase tracking-tight">
										Market Analysis
									</h2>
									<p className="text-xs text-gray-400 font-bold">
										USD / NGN • LIVE TRACKER
									</p>
								</div>
								<div className="text-right">
									<p className="text-[#34A853] font-black flex items-center gap-1 justify-end">
										<TrendingUp size={16} /> +1.24%
									</p>
									<p className="text-[10px] text-gray-400 font-bold uppercase">
										Past 24 Hours
									</p>
								</div>
							</div>

							<div className="h-64 w-full">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={marketData}>
										<defs>
											<linearGradient
												id="colorRate"
												x1="0"
												y1="0"
												x2="0"
												y2="1">
												<stop
													offset="5%"
													stopColor="#34A853"
													stopOpacity={0.2}
												/>
												<stop
													offset="95%"
													stopColor="#34A853"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="#F1F1F1"
										/>
										<XAxis dataKey="time" hide />
										<YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
										<Tooltip
											contentStyle={{
												borderRadius: "12px",
												border: "none",
												boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
											}}
											labelStyle={{ fontWeight: "bold" }}
										/>
										<Area
											type="monotone"
											dataKey="rate"
											stroke="#34A853"
											strokeWidth={4}
											fillOpacity={1}
											fill="url(#colorRate)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>

							{/* Histogram (Volume/Activity) */}
							<div className="h-20 w-full mt-4">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={marketData}>
										<Bar
											dataKey="volume"
											fill="#E8F5E9"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</section>
					</div>

					{/* Right Side: Mini History/Status */}
					<div className="space-y-8">
						<section className="bg-[#1A1A1A] text-white p-8 rounded-[32px] shadow-xl">
							<h3 className="font-black mb-4 text-sm uppercase tracking-widest text-gray-500">
								Quick Status
							</h3>
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<span className="text-xs font-bold text-gray-400">
										Interswitch API
									</span>
									<span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-xs font-bold text-gray-400">
										Rate Lock Active
									</span>
									<span className="text-xs font-black text-[#34A853]">YES</span>
								</div>
							</div>
						</section>

						<div className="bg-[#E8F5E9] p-8 rounded-[32px]">
							<h3 className="font-black text-[#1A1A1A] mb-4">Market Tip</h3>
							<p className="text-sm text-[#2E7D32] leading-relaxed font-medium">
								Market volatility is low today. This might be a great time to
								lock your rates for the next 24 hours.
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

function BalanceCard({ label, amount, symbol, show, onToggle }: any) {
	return (
		<div className="bg-[#F8F9FA] p-8 rounded-[24px] border border-gray-100 group hover:border-[#34A853]/30 transition-all">
			<p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
				{label}
			</p>
			<div className="flex items-center justify-between">
				<h3 className="text-3xl font-black text-[#1A1A1A]">
					{show ? `${symbol}${amount.toLocaleString()}` : "••••••••"}
				</h3>
				<button
					onClick={onToggle}
					className="text-gray-300 hover:text-[#34A853] transition">
					{show ? <Eye size={22} /> : <EyeOff size={22} />}
				</button>
			</div>
		</div>
	);
}
