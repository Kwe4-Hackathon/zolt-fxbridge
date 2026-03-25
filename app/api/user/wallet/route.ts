import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// app/api/user/wallet/route.ts
export async function GET() {
	const session = await getServerSession();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	await connectDB();

	// Ensure "lockedRate" is included in the string!
	const user = await User.findOne({ email: session.user.email }).select(
		"ngnBalance usdBalance lockedRate",
	);

	if (!user)
		return NextResponse.json({ error: "User not found" }, { status: 404 });

	// Debug log: Check your server console to see if this is null
	console.log("Found User Data:", user);

	return NextResponse.json(user);
}
