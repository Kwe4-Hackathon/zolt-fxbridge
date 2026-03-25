"use client";
import { useState } from "react";

export default function Converter() {
	const [amount, setAmount] = useState(1512000);
	const rate = 1392.86;
	const fee = 12000;

	const convertedValue = (amount - fee) / rate;

	return (
		<div className="bg-[#E8F5E9] p-10 rounded-3xl max-w-4xl mx-auto">
			<div className="text-center mb-8">
				<p className="text-sm text-gray-600 font-medium">Enter Amount</p>
				<p className="font-bold text-lg">1 USD ≈ 1,392.86 NGN</p>
			</div>

			<div className="bg-white flex items-center p-4 rounded-xl border mb-6 shadow-sm">
				<input
					type="number"
					value={amount}
					onChange={(e) => setAmount(Number(e.target.value))}
					className="text-2xl font-bold flex-1 outline-none"
				/>
				<div className="border-l pl-4 flex items-center gap-2 font-bold">
					Convert to USD
					<select className="bg-transparent outline-none"></select>
				</div>
			</div>

			<div className="flex gap-4 justify-center mb-10">
				<button className="bg-[#34A853] text-white px-12 py-3 rounded-xl">
					Lock Rate
				</button>
				<button className="border-2 border-[#34A853] text-[#34A853] px-12 py-3 rounded-xl">
					Send Payment
				</button>
			</div>

			<div className="space-y-4">
				<h4 className="font-bold text-lg">Conversion Breakdown</h4>
				<div className="flex justify-between bg-white p-4 rounded-xl shadow-sm">
					<span className="text-gray-500 uppercase text-sm">
						Converted Value (Supplier Receives)
					</span>
					<span className="font-bold">
						$
						{convertedValue.toLocaleString(undefined, {
							maximumFractionDigits: 2,
						})}
					</span>
				</div>
				<div className="flex justify-between bg-white p-4 rounded-xl shadow-sm">
					<span className="text-gray-500 uppercase text-sm">
						FX Conversion Fee
					</span>
					<span className="font-bold">₦{fee.toLocaleString()}</span>
				</div>
			</div>
		</div>
	);
}
