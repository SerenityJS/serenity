import { DataType } from "@serenityjs/raknet";

import { Item } from "./item";
import { Vector3f } from "./vector3f";

import type { UseItemOnEntityAction } from "../../enums";
import type { BinaryStream } from "@serenityjs/binaryutils";

class TransactionUseItemOnEntity extends DataType {
	/**
	 * The action.
	 */
	public action: UseItemOnEntityAction;

	/**
	 * The click position.
	 */
	public clickPosition: Vector3f;

	/**
	 * The entity runtime id.
	 */
	public entityRuntimeId: bigint;

	/**
	 * The held item.
	 */
	public heldItem: Item;

	/**
	 * The hotbar slot.
	 */
	public hotbarSlot: number;

	/**
	 * The player position.
	 */
	public playerPosition: Vector3f;

	/**
	 * Creates a new TransactionUseItemOnEntity.
	 */
	public constructor(
		action: UseItemOnEntityAction,
		clickPosition: Vector3f,
		entityRuntimeId: bigint,
		heldItem: Item,
		hotbarSlot: number,
		playerPosition: Vector3f
	) {
		super();
		this.action = action;
		this.clickPosition = clickPosition;
		this.entityRuntimeId = entityRuntimeId;
		this.heldItem = heldItem;
		this.hotbarSlot = hotbarSlot;
		this.playerPosition = playerPosition;
	}

	public static override read(
		stream: BinaryStream
	): TransactionUseItemOnEntity {
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
		return new TransactionUseItemOnEntity(
			action,
			clickPosition,
			entityRuntimeId,
			heldItem,
			hotbarSlot,
			playerPosition
		);
	}

	public static override write(
		stream: BinaryStream,
		value: TransactionUseItemOnEntity
	): void {
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

export { TransactionUseItemOnEntity };
