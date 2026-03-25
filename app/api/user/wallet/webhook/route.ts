// app/api/wallet/webhook/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		console.log("Interswitch webhook received:", body);

		// Verify the transaction (in production, you'd verify the signature)
		const { txn_ref, amount, status, customer_email } = body;

		if (status === "00") {
			// Successful transaction
			await connectDB();

			// Find user by email (you'd need to store email in the initial request)
			const user = await User.findOne({ email: customer_email });

			if (user) {
				// Add to balance
				const amountNgn = amount / 100; // Convert from Kobo
				user.ngnBalance += amountNgn;

				// Add transaction record
				user.transactions.push({
					txnId: txn_ref,
					recipient: "Self (Wallet Top-up)",
					amountNgn: amountNgn,
					amountUsd: amountNgn / 1500, // Using current rate
					rate: 1500,
					status: "Completed",
					createdAt: new Date(),
				});

				await user.save();
				console.log(`Wallet topped up for ${customer_email}: ₦${amountNgn}`);
			}
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
	}
}
