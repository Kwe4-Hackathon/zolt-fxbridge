// app/api/fx/rate/route.ts
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

		if (!API_KEY) {
			throw new Error("Missing EXCHANGE_RATE_API_KEY");
		}

		const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

		const response = await fetch(url, {
			cache: "no-store",
			signal: AbortSignal.timeout(8000),
		});

		if (!response.ok) {
			throw new Error(`ExchangeRate API error: ${response.status}`);
		}

		const data = await response.json();

		const ngnRate = data.conversion_rates?.NGN;

		if (!ngnRate) {
			throw new Error("NGN rate missing");
		}

		return NextResponse.json({
			from: "USD",
			to: "NGN",
			rate: ngnRate, // ✅ CORRECT
			provider: "ExchangeRate API",
			lastUpdated: data.time_last_update_utc,
		});
	} catch (error: any) {
		console.error("FX ERROR:", error.message);

		return NextResponse.json(
			{
				error: "Failed to fetch exchange rate",
				details: error.message,
			},
			{ status: 500 },
		);
	}
}
