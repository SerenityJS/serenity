import { DataType } from "@serenityjs/raknet";

import { TransactionType } from "../../enums";

import { TransactionItemRelease } from "./transaction-item-release";
import { TransactionUseItem } from "./transaction-use-item";
import { TransactionUseItemOnEntity } from "./transaction-use-item-on-entity";
import { NetworkItemStackDescriptor } from "./network-item-stack-descriptor";

import type {
	ItemReleaseAction,
	UseItemOnEntityAction,
	UseItemAction
} from "../../enums";
import type { BlockCoordinates } from "./block-coordinates";
import type { BinaryStream, Endianness } from "@serenityjs/binarystream";
import type { Vector3f } from "./vector3f";

class TransactionData extends DataType {
	public action:
		| ItemReleaseAction
		| UseItemAction
		| UseItemOnEntityAction
		| null;

	public blockPosition: BlockCoordinates | null;
	public blockRuntimeId: number | null;
	public clickPosition: Vector3f | null;
	public entityRuntimeId: bigint | null;
	public face: number | null;
	public headPosition: Vector3f | null;
	public heldItem: NetworkItemStackDescriptor | null;
	public hotbarSlot: number | null;
	public playerPosition: Vector3f | null;

	public constructor(
		action: ItemReleaseAction | UseItemAction | UseItemOnEntityAction | null,
		blockPosition: BlockCoordinates | null,
		blockRuntimeId: number | null,
		clickPosition: Vector3f | null,
		entityRuntimeId: bigint | null,
		face: number | null,
		headPosition: Vector3f | null,
		heldItem: NetworkItemStackDescriptor | null,
		hotbarSlot: number | null,
		playerPosition: Vector3f | null
	) {
		super();
		this.action = action;
		this.blockPosition = blockPosition;
		this.blockRuntimeId = blockRuntimeId;
		this.clickPosition = clickPosition;
		this.entityRuntimeId = entityRuntimeId;
		this.face = face;
		this.headPosition = headPosition;
		this.heldItem = heldItem;
		this.hotbarSlot = hotbarSlot;
		this.playerPosition = playerPosition;
	}

	public static override read(
		stream: BinaryStream,
		endian: Endianness,
		type: TransactionType
	): TransactionData | null {
		// Check if the type is Normal or InventoryMismatch.
		if (
			type === TransactionType.Normal ||
			type === TransactionType.InventoryMismatch
		)
			return null;

		// Check if the type is ItemUse.
		if (type === TransactionType.ItemUse) {
			// Read the data.
			const data = TransactionUseItem.read(stream);

			// Return the TransactionUseItem.
			return {
				headPosition: null,
				entityRuntimeId: null,
				...data
			};
		}

		// Check if the type is ItemUseOnEntity.
		if (type === TransactionType.ItemUseOnEntity) {
			// Read the data.
			const data = TransactionUseItemOnEntity.read(stream);

			// Return the TransactionUseItemOnEntityEntry.
			return {
				headPosition: null,
				blockPosition: null,
				blockRuntimeId: null,
				face: null,
				...data
			};
		}

		// Check if the type is ItemRelease.
		if (type === TransactionType.ItemRelease) {
			// Read the data.
			const data = TransactionItemRelease.read(stream);

			// Return the TransactionItemReleaseEntry.
			return {
				entityRuntimeId: null,
				blockPosition: null,
				blockRuntimeId: null,
				playerPosition: null,
				clickPosition: null,
				face: null,
				...data
			};
		}

		return null;
	}
}

export { TransactionData };
