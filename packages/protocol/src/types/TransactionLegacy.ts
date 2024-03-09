import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

interface Transactions {
	changedSlots: number[];
	containerId: number;
}

class TransactionLegacy extends DataType {
	public requestId: number;
	public transactions: Transactions[] | null;

	public constructor(requestId: number, transactions: Transactions[] | null) {
		super();
		this.requestId = requestId;
		this.transactions = transactions;
	}

	public static override read(stream: BinaryStream): TransactionLegacy {
		// Read the request id.
		const requestId = stream.readZigZag();

		// Check if the request id is 0.
		if (requestId === 0) {
			// Return null.
			return {
				requestId,
				transactions: null,
			};
		}

		// Prepare an array to store the transactions.
		const transactions: Transactions[] = [];

		// Read the number of transactions.
		const amount = stream.readVarInt();

		// We then loop through the amount of transactions.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read the container id.
			const containerId = stream.readByte();

			// Read the number of changed slots.
			const changedSlotsAmount = stream.readVarInt();

			// Prepare an array to store the changed slots.
			const changedSlots: number[] = [];

			// We then loop through the amount of changed slots.
			// Reading the individual fields in the stream.
			for (let j = 0; j < changedSlotsAmount; j++) {
				// Read the changed slot.
				const changedSlot = stream.readUint8();

				// Push the changed slot to the array.
				changedSlots.push(changedSlot);
			}

			// Push the transaction to the array.
			transactions.push({
				changedSlots,
				containerId,
			});
		}

		// Return the transaction.
		return new TransactionLegacy(requestId, transactions);
	}

	public static override write(stream: BinaryStream, value: TransactionLegacy): void {
		// Write the request id.
		stream.writeZigZag(value.requestId);

		// Check if the request id is 0.
		if (value.requestId === 0) {
			// Return null.
			return;
		}

		// Write the number of transactions in the array.
		stream.writeVarInt(value.transactions!.length);

		// Loop through the transactions.
		for (const transaction of value.transactions!) {
			// Write the fields for the transaction.
			stream.writeByte(transaction.containerId);
			stream.writeVarInt(transaction.changedSlots.length);

			// Loop through the changed slots.
			for (const changedSlot of transaction.changedSlots) {
				// Write the changed slot.
				stream.writeUint8(changedSlot);
			}
		}
	}
}

export { TransactionLegacy };
