import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import type { UseItemAction } from '../enums';
import { BlockCoordinates, type BlockCoordinate } from './BlockCoordinates';
import { Item, type ItemEntry } from './Item';
import { Vector3f, type Vec3f } from './Vector3f';

interface TransactionUseItemEntry {
	action: UseItemAction;
	blockPosition: BlockCoordinate;
	blockRuntimeId: number;
	clickPosition: Vec3f;
	face: number;
	heldItem: ItemEntry;
	hotbarSlot: number;
	playerPosition: Vec3f;
}

class TransactionUseItem extends DataType {
	public static override read(stream: BinaryStream): TransactionUseItemEntry {
		// Read the action.
		const action = stream.readVarInt();

		// Read the block position.
		const blockPosition = BlockCoordinates.read(stream);

		// Read the face.
		const face = stream.readZigZag();

		// Read the hotbar slot.
		const hotbarSlot = stream.readZigZag();

		// Read the Item.
		const heldItem = Item.read(stream);

		// Read the player position.
		const playerPosition = Vector3f.read(stream);

		// Read the click position.
		const clickPosition = Vector3f.read(stream);

		// Read the block runtime id.
		const blockRuntimeId = stream.readVarInt();

		// Return the TransactionUseItemEntry.
		return {
			action,
			blockPosition,
			blockRuntimeId,
			clickPosition,
			face,
			heldItem,
			hotbarSlot,
			playerPosition,
		};
	}

	public static override write(stream: BinaryStream, value: TransactionUseItemEntry): void {
		// Write the action.
		stream.writeVarInt(value.action);

		// Write the block position.
		BlockCoordinates.write(stream, value.blockPosition);

		// Write the face.
		stream.writeZigZag(value.face);

		// Write the hotbar slot.
		stream.writeZigZag(value.hotbarSlot);

		// Write the Item.
		Item.write(stream, value.heldItem);

		// Write the player position.
		Vector3f.write(stream, value.playerPosition);

		// Write the click position.
		Vector3f.write(stream, value.clickPosition);

		// Write the block runtime id.
		stream.writeVarInt(value.blockRuntimeId);
	}
}

export { TransactionUseItem, type TransactionUseItemEntry };
