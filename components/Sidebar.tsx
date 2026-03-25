"use client";

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
import { useState } from "react";

export default function Sidebar({ active }: { active: string }) {
	const [isExpanded, setIsExpanded] = useState(true);

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

	return (
		<aside
			className={`
        bg-white border-r h-screen sticky top-0 flex flex-col 
        transition-all duration-300 ease-in-out shrink-0
        ${isExpanded ? "w-64" : "w-20"}
      `}>
			{/* Header with toggle button */}
			<div className="relative flex items-center justify-between p-4 mb-6">
				<div
					className={`flex items-center gap-2 ${!isExpanded && "justify-center w-full"}`}>
					<div className="bg-[#34A853] p-2 rounded-lg text-white font-bold shadow-sm">
						Z
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
            absolute -right-3 top-8 bg-white border rounded-full p-1.5
            hover:bg-gray-50 transition-all duration-200 shadow-sm
            ${!isExpanded && "right-0"}
          `}>
					{isExpanded ? (
						<ChevronLeft size={16} className="text-gray-600" />
					) : (
						<ChevronRight size={16} className="text-gray-600" />
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
			<div className="pt-6 border-t px-3 space-y-1">
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
		</aside>
	);
}
