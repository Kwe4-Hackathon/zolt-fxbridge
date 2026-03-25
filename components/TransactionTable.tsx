const transactions = [
	{
		id: "FXB20394",
		conversion: "NGN → USD",
		rate: "₦1,190,500",
		status: "Completed",
	},
	{
		id: "FXB20383",
		conversion: "NGN → USD",
		rate: "₦1,240,500",
		status: "Completed",
	},
	{
		id: "FXB20371",
		conversion: "NGN → USD",
		rate: "₦1,320,100",
		status: "Completed",
	},
];

export default function TransactionTable() {
	return (
		<div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
			<table className="w-full text-left text-sm">
				<thead className="bg-gray-50 text-gray-400 font-medium uppercase text-xs">
					<tr>
						<th className="px-6 py-4">TXN ID</th>
						<th className="px-6 py-4">CONVERSION</th>
						<th className="px-6 py-4">RATE</th>
						<th className="px-6 py-4">STATUS</th>
					</tr>
				</thead>
				<tbody className="divide-y">
					{transactions.map((txn) => (
						<tr key={txn.id} className="hover:bg-gray-50 transition">
							<td className="px-6 py-4 font-semibold">{txn.id}</td>
							<td className="px-6 py-4">{txn.conversion}</td>
							<td className="px-6 py-4 font-bold">{txn.rate}</td>
							<td className="px-6 py-4">
								<span className="bg-[#E8F5E9] text-[#34A853] px-3 py-1 rounded-full text-xs font-bold">
									{txn.status}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
