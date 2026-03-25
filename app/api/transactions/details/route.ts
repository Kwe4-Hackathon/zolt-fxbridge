import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const session = await getServerSession();
	if (!session)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { searchParams } = new URL(req.url);
	const txnId = searchParams.get("txnId");

	await connectDB();
	const user = await User.findOne(
		{ email: session.user.email, "transactions.txnId": txnId },
		{ "transactions.$": 1 },
	);

	if (!user || !user.transactions[0]) {
		return NextResponse.json(
			{ error: "Transaction not found" },
			{ status: 404 },
		);
	}

	return NextResponse.json(user.transactions[0]);
}
