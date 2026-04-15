// models/User.ts
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
	txnId: {
		type: String,
		sparse: true, // IMPORTANT: Only apply unique to non-null values
		required: false,
	},
	recipient: String,
	bankName: String,
	accountNumber: String,
	amountNgn: Number,
	amountUsd: Number,
	rate: Number,
	status: {
		type: String,
		enum: ["Pending", "Completed", "Failed"],
		default: "Completed",
	},
	createdAt: { type: Date, default: Date.now },
});

const LockedRateSchema = new mongoose.Schema({
	rate: Number,
	amountNgn: Number,
	expiresAt: Date,
	currencyPair: { type: String, default: "NGN/USD" },
});

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, required: true },
		ngnBalance: { type: Number, default: 250000 },
		usdBalance: { type: Number, default: 0 },
		lockedRate: LockedRateSchema,
		transactions: {
			type: [TransactionSchema],
			default: [],
			required: false,
		},
	},
	{
		timestamps: true,
	},
);

// Ensure proper indexes
UserSchema.index({ email: 1 }, { unique: true });
// Remove the problematic index if it exists
// The sparse: true in TransactionSchema will handle uniqueness properly

export default mongoose.models.User || mongoose.model("User", UserSchema);
