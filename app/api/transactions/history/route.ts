// app/api/history/route.ts
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const session = await getServerSession();
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search");

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		let query: any = {};

		let transactions = await Transaction.find(query).sort({ createdAt: -1 });

		if (search) {
			transactions = transactions.filter(
				(tx: any) =>
					tx.txnId?.toLowerCase().includes(search.toLowerCase()) ||
					tx.recipient?.toLowerCase().includes(search.toLowerCase()),
			);
		}

		return NextResponse.json(transactions, { status: 200 });
	} catch (error) {
		console.error("History API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch history" },
			{ status: 500 },
		);
	}
}
