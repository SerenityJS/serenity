import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import type { ItemReleaseAction } from '../enums';
import { Item, type ItemEntry } from './Item';
import { Vector3f, type Vec3f } from './Vector3f';

interface TransactionItemReleaseEntry {
	action: ItemReleaseAction;
	headPosition: Vec3f;
	heldItem: ItemEntry;
	hotbarSlot: number;
}

class TransactionItemRelease extends DataType {
	public static override read(stream: BinaryStream): TransactionItemReleaseEntry {
		// Read the action.
		const action = stream.readVarInt();

		// Read the hotbar slot.
		const hotbarSlot = stream.readZigZag();

		// Read the Item.
		const heldItem = Item.read(stream);

		// Read the player head position.
		const headPosition = Vector3f.read(stream);

		// Return the TransactionItemReleaseEntry.
		return {
			action,
			headPosition,
			heldItem,
			hotbarSlot,
		};
	}

	public static override write(stream: BinaryStream, value: TransactionItemReleaseEntry): void {
		// Write the action.
		stream.writeVarInt(value.action);

		// Write the hotbar slot.
		stream.writeZigZag(value.hotbarSlot);

		// Write the Item.
		Item.write(stream, value.heldItem);

		// Write the player head position.
		Vector3f.write(stream, value.headPosition);
	}
}

export { TransactionItemRelease, type TransactionItemReleaseEntry };
