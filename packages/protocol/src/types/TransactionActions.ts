import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import type { WindowsIds } from '../enums';
import { TransactionSourceType } from '../enums';
import { Item, type ItemEntry } from './Item';

interface TransactionAction {
	action: number | null;
	flags: number | null;
	inventoryId: WindowsIds | null;
	newItem: ItemEntry;
	oldItem: ItemEntry;
	slot: number;
	sourceType: TransactionSourceType;
}

class TransactionActions extends DataType {
	public static override read(stream: BinaryStream): TransactionAction[] {
		// Prepare an array to store the actions.
		const transactions: TransactionAction[] = [];

		// Read the number of actions.
		const amount = stream.readVarInt();

		// We then loop through the amount of actions.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read the source type.
			const sourceType: TransactionSourceType = stream.readVarInt();

			// Prepare the inventory id.
			let inventoryId: number | null = null;

			// Check if the source type Container or Craft.
			if (sourceType === TransactionSourceType.Container || sourceType === TransactionSourceType.Craft) {
				// Read the inventory id.
				inventoryId = stream.readVarInt();
			}

			// Prepare the flags.
			let flags: number | null = null;

			// Check if the source type is WorldInteraction.
			if (sourceType === TransactionSourceType.WorldInteraction) {
				// Read the flags.
				flags = stream.readVarInt();
			}

			// Prepare the action.
			let action: number | null = null;

			// Check if the source type is Craft or CraftSlot.
			if (sourceType === TransactionSourceType.Craft || sourceType === TransactionSourceType.CraftSlot) {
				// Read the action.
				action = stream.readVarInt();
			}

			// Read the slot.
			const slot = stream.readVarInt();

			// Read the old and new item.
			const oldItem = Item.read(stream);
			const newItem = Item.read(stream);

			// Push the action to the array.
			transactions.push({
				action,
				flags,
				inventoryId,
				slot,
				sourceType,
				newItem,
				oldItem,
			});
		}

		// Return the actions.
		return transactions;
	}

	public static override write(stream: BinaryStream, value: TransactionAction): void {
		// Write the source type.
		stream.writeVarInt(value.sourceType);

		// Check if the source type Container or Craft.
		if (value.sourceType === TransactionSourceType.Container || value.sourceType === TransactionSourceType.Craft) {
			// Write the inventory id.
			stream.writeVarInt(value.inventoryId ?? 0);
		}

		// Check if the source type is WorldInteraction.
		if (value.sourceType === TransactionSourceType.WorldInteraction) {
			// Write the flags.
			stream.writeVarInt(value.flags ?? 0);
		}

		// Check if the source type is Craft or CraftSlot.
		if (value.sourceType === TransactionSourceType.Craft || value.sourceType === TransactionSourceType.CraftSlot) {
			// Write the action.
			stream.writeVarInt(value.action ?? 0);
		}

		// Write the slot.
		stream.writeVarInt(value.slot);

		// Write the old and new item.
		Item.write(stream, value.oldItem);
		Item.write(stream, value.newItem);
	}
}

export { TransactionActions, type TransactionAction };
