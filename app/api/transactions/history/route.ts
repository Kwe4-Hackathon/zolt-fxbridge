// app/api/transactions/history/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const session = await getServerSession();
		if (!session || !session.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search");

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		let transactions = user.transactions || [];

		transactions = transactions.sort(
			(a: any, b: any) =>
				new Date(b.createdAt || b.date).getTime() -
				new Date(a.createdAt || a.date).getTime(),
		);

		if (search) {
			transactions = transactions.filter(
				(tx: any) =>
					tx.txnId?.toLowerCase().includes(search.toLowerCase()) ||
					tx.recipient?.toLowerCase().includes(search.toLowerCase()) ||
					tx.description?.toLowerCase().includes(search.toLowerCase()),
			);
		}

		const formattedTransactions = transactions.map((tx: any) => ({
			_id: tx._id || tx.txnId,
			txnId: tx.txnId,
			recipient: tx.recipient || "Wallet Top-up",
			amountNgn: tx.amountNgn || tx.amount || 0,
			amountUsd: tx.amountUsd || 0,
			status: tx.status || "Completed",
			createdAt: tx.createdAt || tx.date || new Date(),
			bankName: tx.bankName,
			accountNumber: tx.recipientAccount,
			type: tx.type || (tx.recipient === "Wallet Top-up" ? "credit" : "debit"),
			description: tx.description || tx.narration,
		}));

		return NextResponse.json(formattedTransactions, { status: 200 });
	} catch (error) {
		console.error("History API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch history" },
			{ status: 500 },
		);
	}
}
