// lib/interswitch.ts
import crypto from "crypto";

export function getInterswitchHeaders(method: string, url: string) {
	const clientId = process.env.INTERSWITCH_CLIENT_ID!;
	const secretKey = process.env.INTERSWITCH_SECRET_KEY!;
	const timestamp = Date.now().toString();

	// Create signature
	const signatureString = `${method}${url}${timestamp}`;
	const signature = crypto
		.createHmac("sha256", secretKey)
		.update(signatureString)
		.digest("base64");

	return {
		"Content-Type": "application/json",
		"User-Agent": "Zolt/1.0",
		"Isw-ClientId": clientId,
		"Isw-Timestamp": timestamp,
		"Isw-Signature": signature,
	};
}

export function getAuthHeader(method: string, path: string) {
	// Legacy function for backward compatibility
	return getInterswitchHeaders(method, path);
}
