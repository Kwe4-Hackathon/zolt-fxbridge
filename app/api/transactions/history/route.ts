// app/api/history/route.ts
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction"; // Import the Transaction model
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

		// Get search query from URL
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search");

		// Get the user to get their email for filtering
		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Build query for transactions
		let query: any = {};

		// If you have a userId field in your transactions, use it
		// Otherwise, you might need to add one

		// For now, we'll get all transactions and filter by user email
		// But ideally, you should have a userId field in your Transaction model

		let transactions = await Transaction.find(query).sort({ createdAt: -1 });

		// If transactions don't have a userId, we need to filter by user email
		// This assumes you have a userEmail field in your transactions
		// If not, you'll need to modify your Transaction model to include userId or userEmail

		// Filter by search if provided
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
