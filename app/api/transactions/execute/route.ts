import { getAuthHeader } from "@/lib/interswitch";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
	const session = await getServerSession();
	if (!session) return new Response("Unauthorized", { status: 401 });

	const { amountNgn, recipientData } = await req.json();
	const txnId = `FXB-${Math.floor(Math.random() * 90000 + 10000)}`;

	// 1. Interswitch Payment Logic (Pseudo-code for Interswitch Transfer API)
	const authHeaders = getAuthHeader("POST", "/payment/v1/transfers");
	/* await interswitchClient.post('/payment/v1/transfers', {
    amount: amountNgn * 100, // Kobo
    terminalId: "3PBP0001",
    paymentItemCode: "01",
    ...recipientData
  }, { headers: authHeaders });
  */

	// 2. Database Update
	await connectDB();
	await User.findByIdAndUpdate(session.user.id, {
		$inc: { ngnBalance: -amountNgn },
		$push: {
			transactions: {
				txnId,
				recipient: recipientData.name,
				amountNgn,
				amountUsd: amountNgn / 1500,
				rate: 1500,
			},
		},
	});

	return Response.json({ success: true, txnId });
}
