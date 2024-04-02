import { DataType } from "@serenityjs/raknet";

import { BlockCoordinates } from "./block-coordinates";
import { Vector3f } from "./vector3f";
import { NetworkItemStackDescriptor } from "./network-item-stack-descriptor";

import type { UseItemAction } from "../../enums";
import type { BinaryStream } from "@serenityjs/binarystream";

class TransactionUseItem extends DataType {
	public action: UseItemAction;
	public blockPosition: BlockCoordinates;
	public blockRuntimeId: number;
	public clickPosition: Vector3f;
	public face: number;
	public heldItem: NetworkItemStackDescriptor;
	public hotbarSlot: number;
	public playerPosition: Vector3f;

	public constructor(
		action: UseItemAction,
		blockPosition: BlockCoordinates,
		blockRuntimeId: number,
		clickPosition: Vector3f,
		face: number,
		heldItem: NetworkItemStackDescriptor,
		hotbarSlot: number,
		playerPosition: Vector3f
	) {
		super();
		this.action = action;
		this.blockPosition = blockPosition;
		this.blockRuntimeId = blockRuntimeId;
		this.clickPosition = clickPosition;
		this.face = face;
		this.heldItem = heldItem;
		this.hotbarSlot = hotbarSlot;
		this.playerPosition = playerPosition;
	}

	public static override read(stream: BinaryStream): TransactionUseItem {
		// Read the action.
		const action = stream.readVarInt();

		// Read the block position.
		const blockPosition = BlockCoordinates.read(stream);

		// Read the face.
		const face = stream.readZigZag();

		// Read the hotbar slot.
		const hotbarSlot = stream.readZigZag();

		// Read the Item.
		const heldItem = NetworkItemStackDescriptor.read(stream);

		// Read the player position.
		const playerPosition = Vector3f.read(stream);

		// Read the click position.
		const clickPosition = Vector3f.read(stream);

		// Read the block runtime id.
		const blockRuntimeId = stream.readVarInt();

		// Return the TransactionUseItem.
		return new TransactionUseItem(
			action,
			blockPosition,
			blockRuntimeId,
			clickPosition,
			face,
			heldItem,
			hotbarSlot,
			playerPosition
		);
	}

	public static override write(
		stream: BinaryStream,
		value: TransactionUseItem
	): void {
		// Write the action.
		stream.writeVarInt(value.action);

		// Write the block position.
		BlockCoordinates.write(stream, value.blockPosition);

		// Write the face.
		stream.writeZigZag(value.face);

		// Write the hotbar slot.
		stream.writeZigZag(value.hotbarSlot);

		// Write the Item.
		NetworkItemStackDescriptor.write(stream, value.heldItem);

		// Write the player position.
		Vector3f.write(stream, value.playerPosition);

		// Write the click position.
		Vector3f.write(stream, value.clickPosition);

		// Write the block runtime id.
		stream.writeVarInt(value.blockRuntimeId);
	}
}

export { TransactionUseItem };
