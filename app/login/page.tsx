"use client";
import {
	IconBoltFilled,
	IconBrandAppleFilled,
	IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const res = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (res?.error) {
			setError("Invalid email or password. Please try again.");
			setLoading(false);
		} else {
			router.push("/dashboard");
		}
	};

	return (
		<div className="flex min-h-screen bg-white">
			{/* Left Form Side */}
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-24">
				<div className="max-w-md w-full">
					<Link href="/" className="flex items-center gap-2 mb-3">
						<div className="bg-[#34A853] p-2 rounded-lg text-white font-bold shadow-sm">
							<IconBoltFilled />
						</div>

						<h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#34A853] to-[#1e7e34] bg-clip-text text-transparent">
							ZOLT
						</h1>
					</Link>
					<h1 className="text-4xl font-black mb-2 text-[#1A1A1A]">
						Welcome back!
					</h1>
					<p className="text-gray-500 mb-8">
						New to Zolt?{" "}
						<Link href="/signup" className="text-[#34A853] font-bold underline">
							Create an account
						</Link>
					</p>

					{error && (
						<div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm font-medium">
							{error}
						</div>
					)}

					<form onSubmit={handleLogin} className="space-y-5">
						<div>
							<label className="block text-sm font-bold mb-2">
								Email address
							</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Zoltsupport@gmail.com"
								className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-[#34A853]/20 focus:border-[#34A853] transition"
							/>
						</div>

						<div className="relative">
							<label className="block text-sm font-bold mb-2">Password</label>
							<input
								type={showPassword ? "text" : "password"}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-[#34A853]/20 focus:border-[#34A853] transition"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-[46px] text-gray-400">
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>

						<div className="flex justify-end">
							<Link href="/forgot-password text-sm font-bold text-[#34A853]">
								Forgot Password?
							</Link>
						</div>

						<button
							disabled={loading}
							className="w-full bg-[#34A853] text-white py-4 rounded-xl font-bold hover:bg-[#2d9147] transition shadow-lg shadow-green-100 disabled:opacity-50">
							{loading ? "Logging in..." : "Login"}
						</button>
					</form>

					<div className="relative flex py-8 items-center">
						<div className="flex-grow border-t border-gray-100"></div>
						<span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
							Or continue with
						</span>
						<div className="flex-grow border-t border-gray-100"></div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<button className="border p-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition">
							<IconBrandGoogleFilled size={20} /> Google
						</button>
						<button className="border p-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition">
							<IconBrandAppleFilled size={20} /> Apple
						</button>
					</div>
				</div>
			</div>

			{/* Right Image Side (Brand Visual) */}
			<div className="hidden lg:block w-1/2 bg-[#D1E9FF] relative overflow-hidden">
				<img
					src="/login.png"
					alt="Zolt Elephant"
					className="absolute inset-0 w-full h-full object-cover"
				/>
			</div>
		</div>
	);
}
