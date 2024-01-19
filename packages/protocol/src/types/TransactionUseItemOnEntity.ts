import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import type { UseItemOnEntityAction } from '../enums';
import { Item, type ItemEntry } from './Item';
import { Vector3f, type Vec3f } from './Vector3f';

interface TransactionUseItemOnEntityEntry {
	action: UseItemOnEntityAction;
	clickPosition: Vec3f;
	entityRuntimeId: bigint;
	heldItem: ItemEntry;
	hotbarSlot: number;
	playerPosition: Vec3f;
}

class TransactionUseItemOnEntity extends DataType {
	public static override read(stream: BinaryStream): TransactionUseItemOnEntityEntry {
		// Read the entity runtime id.
		const entityRuntimeId = stream.readVarLong();

		// Read the action.
		const action = stream.readVarInt();

		// Read the hotbar slot.
		const hotbarSlot = stream.readZigZag();

		// Read the Item.
		const heldItem = Item.read(stream);

		// Read the player position.
		const playerPosition = Vector3f.read(stream);

		// Read the click position.
		const clickPosition = Vector3f.read(stream);

		// Return the TransactionUseItemOnEntityEntry.
		return {
			entityRuntimeId,
			action,
			clickPosition,
			heldItem,
			hotbarSlot,
			playerPosition,
		};
	}

	public static override write(stream: BinaryStream, value: TransactionUseItemOnEntityEntry): void {
		// Write the entity runtime id.
		stream.writeVarLong(value.entityRuntimeId);

		// Write the action.
		stream.writeVarInt(value.action);

		// Write the hotbar slot.
		stream.writeZigZag(value.hotbarSlot);

		// Write the Item.
		Item.write(stream, value.heldItem);

		// Write the player position.
		Vector3f.write(stream, value.playerPosition);

		// Write the click position.
		Vector3f.write(stream, value.clickPosition);
	}
}

export { TransactionUseItemOnEntity, type TransactionUseItemOnEntityEntry };
