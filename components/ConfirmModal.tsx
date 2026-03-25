"use client";

export default function ConfirmModal({ isOpen, onConfirm, onCancel }: any) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl animate-in zoom-in duration-200">
				<h2 className="text-2xl font-black mb-2">Review & Securely Confirm</h2>
				<p className="text-gray-500 mb-8 px-4">
					You are about to make a transaction please double-check before
					sending.
				</p>

				<div className="relative mb-10 flex justify-center">
					{/* Mocking the Illustration */}
					<div className="w-full h-full rounded-2xl flex items-center justify-center relative">
						<img
							src="/confirm.png"
							alt="Review"
							className="w-70 object-contain"
						/>
					</div>
				</div>

				<div className="flex gap-4">
					<button
						onClick={onConfirm}
						className="flex-1 bg-[#34A853] text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200">
						Proceed
					</button>
					<button
						onClick={onCancel}
						className="flex-1 bg-red-50 text-red-500 py-4 rounded-xl font-bold">
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
