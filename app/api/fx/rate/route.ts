// app/api/fx/rate/route.ts
import { getInterswitchHeaders } from "@/lib/interswitch";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	// Force NGN to USD only - ignore any query parameters
	const from = "NGN";
	const to = "USD";
	const url = `https://sandbox.interswitchng.com/api/v1/exchange/rates?from=${from}&to=${to}`;

	try {
		const headers = getInterswitchHeaders("GET", url);

		const response = await fetch(url, {
			headers,
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			throw new Error(`Interswitch responded with ${response.status}`);
		}

		const data = await response.json();

		// Return only NGN to USD rate
		return NextResponse.json({
			from: "NGN",
			to: "USD",
			rate: data?.rate || 1450.0,
			fee: 12000,
			provider: "Interswitch",
		});
	} catch (error: any) {
		console.error("Interswitch API Error Details:", error.message);

		// Return fallback NGN to USD rate
		return NextResponse.json(
			{
				from: "NGN",
				to: "USD",
				rate: 1450.0,
				fee: 12000,
				provider: "Zolt Fallback (Demo Mode)",
				isFallback: true,
			},
			{ status: 200 },
		);
	}
}
