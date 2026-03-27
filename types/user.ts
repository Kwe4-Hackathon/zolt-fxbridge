// types/user.ts (Client-safe type definitions)
export interface UserTransaction {
	txnId: string;
	type: "debit" | "credit";
	recipient: string;
	recipientAccount?: string;
	bankName?: string;
	amountNgn: number;
	amountUsd?: number;
	rate?: number;
	status: "pending" | "completed" | "failed";
	reference?: string;
	narration?: string;
	createdAt: Date;
}

export interface UserLockedRate {
	amountNgn: number;
	rate: number;
	expiresAt: Date;
}

// Client-safe user type without Mongoose-specific fields
export interface ClientUser {
	_id: string;
	email: string;
	name?: string;
	ngnBalance: number;
	usdBalance: number;
	lockedRate?: UserLockedRate;
	transactions?: UserTransaction[];
}
