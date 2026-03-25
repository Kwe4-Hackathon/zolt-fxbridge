import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
	const session = await getServerSession();
	if (!session)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	await connectDB();
	const user = await User.findOne({ email: session.user.email });

	if (!user)
		return NextResponse.json({ error: "User not found" }, { status: 404 });

	return NextResponse.json({
		name: user.name,
		ngnBalance: user.ngnBalance,
		usdBalance: user.usdBalance,
	});
}
