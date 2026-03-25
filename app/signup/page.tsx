"use client";
import { Apple } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast"; // Import toast

export default function Signup() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch("/api/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (res.ok) {
				// Success Toast
				toast.success(
					`Welcome to Zolt, ${formData.name}! Redirecting to login...`,
					{
						duration: 3000,
						style: {
							border: "1px solid #34A853",
							padding: "16px",
							color: "#34A853",
							fontWeight: "bold",
						},
						iconTheme: {
							primary: "#34A853",
							secondary: "#FFFAEE",
						},
					},
				);

				// Wait a bit so they can read the toast
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} else {
				toast.error(data.error || "Signup failed");
			}
		} catch (err) {
			toast.error("Network error. Please check your connection.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-white">
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-24">
				<h1 className="text-4xl font-black mb-2">Create an Account</h1>
				<p className="text-gray-500 mb-8">
					Returning user?{" "}
					<Link href="/login" className="text-[#34A853] underline font-bold">
						Log In
					</Link>
				</p>

				<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
					<div>
						<label className="block text-sm font-bold mb-1">Name</label>
						<input
							required
							type="text"
							placeholder="John Daniel"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-[#34A853]/20 focus:border-[#34A853] transition"
						/>
					</div>
					<div>
						<label className="block text-sm font-bold mb-1">
							Email address
						</label>
						<input
							required
							type="email"
							placeholder="Zoltsupport@gmail.com"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-[#34A853]/20 focus:border-[#34A853] transition"
						/>
					</div>
					<div>
						<label className="block text-sm font-bold mb-1">Password</label>
						<input
							required
							type="password"
							placeholder="Enter a strong password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-[#34A853]/20 focus:border-[#34A853] transition"
						/>
					</div>

					<div className="flex items-center gap-2 py-2">
						<input
							required
							type="checkbox"
							id="terms"
							className="accent-[#34A853] w-4 h-4"
						/>
						<label htmlFor="terms" className="text-sm font-medium">
							I agree to the{" "}
							<span className="text-[#34A853] underline cursor-pointer font-bold">
								Terms & Policy
							</span>
						</label>
					</div>

					<button
						disabled={loading}
						type="submit"
						className="w-full bg-[#34A853] text-white py-4 rounded-xl font-bold hover:bg-[#2d9147] transition-all shadow-lg shadow-green-100 disabled:bg-gray-300">
						{loading ? "Creating Account..." : "Signup"}
					</button>
				</form>

				<div className="max-w-md mt-8">
					<div className="relative flex py-5 items-center">
						<div className="flex-grow border-t border-gray-200"></div>
						<span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
							Or continue with
						</span>
						<div className="flex-grow border-t border-gray-200"></div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<button className="w-full border p-3 rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-gray-50 transition">
							<Apple size={20} /> Google
						</button>
						<button className="w-full border p-3 rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-gray-50 transition">
							<Apple size={20} /> Apple
						</button>
					</div>
				</div>
			</div>

			<div className="hidden lg:block w-1/2 bg-[#D1E9FF] relative overflow-hidden">
				<img
					src="/register.png"
					alt="Zolt Background"
					className="absolute inset-0 w-full h-full object-cover"
				/>
			</div>
		</div>
	);
}
