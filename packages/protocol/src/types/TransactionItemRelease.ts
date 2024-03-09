import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';
import type { ItemReleaseAction } from '../enums/index.js';
import { Item } from './Item.js';
import { Vector3f } from './Vector3f.js';

class TransactionItemRelease extends DataType {
	public action: ItemReleaseAction;
	public headPosition: Vector3f;
	public heldItem: Item;
	public hotbarSlot: number;

	public constructor(action: ItemReleaseAction, headPosition: Vector3f, heldItem: Item, hotbarSlot: number) {
		super();
		this.action = action;
		this.headPosition = headPosition;
		this.heldItem = heldItem;
		this.hotbarSlot = hotbarSlot;
	}

	public static override read(stream: BinaryStream): TransactionItemRelease {
		// Read the action.
		const action = stream.readVarInt();

		// Read the hotbar slot.
		const hotbarSlot = stream.readZigZag();

		// Read the Item.
		const heldItem = Item.read(stream);

		// Read the player head position.
		const headPosition = Vector3f.read(stream);

		// Return the TransactionItemRelease.
		return new TransactionItemRelease(action, headPosition, heldItem, hotbarSlot);
	}

	public static override write(stream: BinaryStream, value: TransactionItemRelease): void {
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

export { TransactionItemRelease };
