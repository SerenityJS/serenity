import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import type { WindowsIds } from '../enums';
import { TransactionSourceType } from '../enums';
import { Item } from './Item';

class TransactionActions extends DataType {
	public action: number | null;
	public flags: number | null;
	public inventoryId: WindowsIds | null;
	public newItem: Item;
	public oldItem: Item;
	public slot: number;
	public sourceType: TransactionSourceType;

	public constructor(
		action: number | null,
		flags: number | null,
		inventoryId: WindowsIds | null,
		newItem: Item,
		oldItem: Item,
		slot: number,
		sourceType: TransactionSourceType,
	) {
		super();
		this.action = action;
		this.flags = flags;
		this.inventoryId = inventoryId;
		this.newItem = newItem;
		this.oldItem = oldItem;
		this.slot = slot;
		this.sourceType = sourceType;
	}

	public static override read(stream: BinaryStream): TransactionActions[] {
		// Prepare an array to store the actions.
		const transactions: TransactionActions[] = [];

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
			transactions.push(new TransactionActions(action, flags, inventoryId, newItem, oldItem, slot, sourceType));
		}

		// Return the actions.
		return transactions;
	}

	public static override write(stream: BinaryStream, value: TransactionActions): void {
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

export { TransactionActions };
