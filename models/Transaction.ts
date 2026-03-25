// models/Transaction.ts
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
	{
		txnId: { type: String, required: true, unique: true },
		recipient: { type: String, required: true },
		bankName: { type: String },
		accountNumber: { type: String },
		amountNgn: { type: Number, required: true },
		amountUsd: { type: Number, required: true },
		rate: { type: Number, required: true },
		status: {
			type: String,
			enum: ["Pending", "Completed", "Failed"],
			default: "Pending",
		},
		provider: { type: String, default: "Interswitch" },
		expiresAt: { type: Date },
	},
	{ timestamps: true },
);

export default mongoose.models.Transaction ||
	mongoose.model("Transaction", TransactionSchema);
