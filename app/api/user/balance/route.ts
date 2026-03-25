// app/api/user/balance/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getServerSession();
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			balance: user.ngnBalance,
			usdBalance: user.usdBalance,
		});
	} catch (error) {
		console.error("Balance fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch balance" },
			{ status: 500 },
		);
	}
}
