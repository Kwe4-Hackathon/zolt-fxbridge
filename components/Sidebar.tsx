"use client";

import { IconBoltFilled } from "@tabler/icons-react";
import {
	ChevronLeft,
	ChevronRight,
	History,
	LayoutDashboard,
	Lock,
	LogOut,
	Repeat,
	Send,
	Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar({ active }: { active: string }) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Check if screen is mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth < 768) {
				setIsExpanded(false);
			} else {
				setIsExpanded(true);
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const menu = [
		{
			id: "dashboard",
			icon: LayoutDashboard,
			label: "Dashboard",
			path: "/dashboard",
		},
		{ id: "convert", icon: Repeat, label: "Convert", path: "/convert" },
		{ id: "rate-lock", icon: Lock, label: "Rate Lock", path: "/rate-lock" },
		{ id: "transfer", icon: Send, label: "Transfer", path: "/transfer" },
		{ id: "history", icon: History, label: "History", path: "/history" },
	];

	// Mobile Bottom Navigation Bar
	if (isMobile) {
		return (
			<>
				{/* Mobile Bottom Navigation */}
				<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
					<div className="flex justify-around items-center px-4 py-2">
						{menu.map((item) => (
							<Link key={item.id} href={item.path}>
								<div
									className={`
										flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
										${active === item.id ? "text-[#34A853]" : "text-gray-500 hover:text-gray-700"}
									`}
									title={item.label}>
									<item.icon size={20} />
									<span className="text-[10px] font-medium">
										{item.label === "Dashboard"
											? "Home"
											: item.label === "Convert"
												? "Convert"
												: item.label === "Rate Lock"
													? "Lock"
													: item.label === "Transfer"
														? "Send"
														: item.label}
									</span>
								</div>
							</Link>
						))}

						{/* Settings Button */}
						<Link href="/settings">
							<div
								className={`
									flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
									${active === "settings" ? "text-[#34A853]" : "text-gray-500"}
								`}>
								<Settings size={20} />
								<span className="text-[10px] font-medium">Settings</span>
							</div>
						</Link>
					</div>
				</nav>

				{/* Floating Action Button for Logout (Optional) */}
				<button
					onClick={() => signOut({ callbackUrl: "/login" })}
					className="fixed bottom-20 right-4 bg-[#D93025] text-white p-3 rounded-full shadow-lg z-50 md:hidden hover:bg-red-600 transition-all">
					<LogOut size={20} />
				</button>
			</>
		);
	}

	// Desktop Sidebar (Collapsible)
	return (
		<>
			{/* Mobile Menu Button (visible only on mobile, but we're in desktop mode) */}
			{/* Desktop Sidebar */}
			<aside
				className={`
					bg-[#F5F5F5] p-2 border-r border-gray-300 h-screen sticky top-0 flex flex-col 
					transition-all duration-300 ease-in-out shrink-0 hidden md:flex
					${isExpanded ? "w-64" : "w-20"}
				`}>
				<div className="bg-white rounded-lg shadow-lg h-full flex flex-col justify-between">
					{/* Header with toggle button */}
					<div className="relative flex items-center justify-between p-4 mb-6">
						<div
							className={`flex items-center gap-2 ${!isExpanded && "justify-center w-full"}`}>
							<div className="bg-[#34A853] p-2 rounded-lg text-white font-bold shadow-sm">
								<IconBoltFilled />
							</div>
							{isExpanded && (
								<h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#34A853] to-[#1e7e34] bg-clip-text text-transparent">
									ZOLT
								</h1>
							)}
						</div>

						{/* Toggle button */}
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className={`
							absolute -right-3 top-8 bg-[#5F5F5F] border rounded-full p-1.5
							hover:bg-[#5F5F5F] transition-all duration-200 shadow-sm
							${!isExpanded && "right-0"}
						`}>
							{isExpanded ? (
								<ChevronLeft size={16} className="text-white" />
							) : (
								<ChevronRight size={16} className="text-white" />
							)}
						</button>
					</div>

					{/* Navigation Menu */}
					<nav className="flex-1 space-y-1 px-3 overflow-y-auto">
						{menu.map((item) => (
							<Link key={item.id} href={item.path}>
								<div
									className={`
									group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
									${
										active === item.id
											? "bg-[#C8E6C9] text-black font-semibold shadow-sm"
											: "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
									}
									${!isExpanded && "justify-center"}
								`}
									title={!isExpanded ? item.label : undefined}>
									<item.icon size={20} className="shrink-0" />
									{isExpanded && (
										<span className="transition-opacity duration-200">
											{item.label}
										</span>
									)}
								</div>
							</Link>
						))}
					</nav>

					{/* Bottom Section */}
					<div className="pt-6 border-t border-gray-200 px-3 space-y-1">
						<Link href="/settings">
							<div
								className={`
								flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200
								${!isExpanded && "justify-center"}
							`}
								title={!isExpanded ? "Settings" : undefined}>
								<Settings size={20} className="shrink-0" />
								{isExpanded && <span>Settings</span>}
							</div>
						</Link>

						<button
							onClick={() => signOut({ callbackUrl: "/login" })}
							className={`
							w-full flex items-center gap-3 p-3 text-[#D93025] hover:bg-red-50 rounded-xl cursor-pointer transition-all duration-200
							${!isExpanded && "justify-center"}
						`}
							title={!isExpanded ? "Log out" : undefined}>
							<LogOut size={20} className="shrink-0" />
							{isExpanded && <span>Log out</span>}
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}
