// app/api/history/route.ts
import { connectDB } from "@/lib/mongodb";
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

		// Get user with their transactions
		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		let transactions = user.transactions || [];

		// Filter by search if provided
		if (search) {
			transactions = transactions.filter(
				(tx: any) =>
					tx.txnId?.toLowerCase().includes(search.toLowerCase()) ||
					tx.recipient?.toLowerCase().includes(search.toLowerCase()),
			);
		}

		// Sort by newest first
		transactions.sort(
			(a: any, b: any) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

		return NextResponse.json(transactions, { status: 200 });
	} catch (error) {
		console.error("History API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch history" },
			{ status: 500 },
		);
	}
}
