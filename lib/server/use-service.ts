// lib/server/user-service.ts (Server-only file)
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { Types } from "mongoose";
export async function getUserByEmail(email: string) {
	await connectDB();
	return await User.findOne({ email });
}

export async function getUserById(id: string | Types.ObjectId) {
	await connectDB();
	return await User.findById(id);
}

export async function updateUserBalance(
	userId: string | Types.ObjectId,
	amount: number,
) {
	await connectDB();
	return await User.findByIdAndUpdate(
		userId,
		{ $inc: { ngnBalance: amount } },
		{ new: true },
	);
}

export async function createTransaction(
	userId: string | Types.ObjectId,
	transactionData: any,
) {
	await connectDB();
	return await User.findByIdAndUpdate(
		userId,
		{ $push: { transactions: transactionData } },
		{ new: true },
	);
}
