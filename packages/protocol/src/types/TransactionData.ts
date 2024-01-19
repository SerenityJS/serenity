import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { TransactionType } from '../enums';
import type { ItemReleaseAction, UseItemOnEntityAction, UseItemAction } from '../enums';
import type { BlockCoordinate } from './BlockCoordinates';
import type { ItemEntry } from './Item';
import { TransactionItemRelease } from './TransactionItemRelease';
import { TransactionUseItem } from './TransactionUseItem';
import { TransactionUseItemOnEntity } from './TransactionUseItemOnEntity';
import type { Vec3f } from './Vector3f';

interface TransactionDataEntry {
	action: ItemReleaseAction | UseItemAction | UseItemOnEntityAction | null;
	blockPosition: BlockCoordinate | null;
	blockRuntimeId: number | null;
	clickPosition: Vec3f | null;
	entityRuntimeId: bigint | null;
	face: number | null;
	headPosition: Vec3f | null;
	heldItem: ItemEntry | null;
	hotbarSlot: number | null;
	playerPosition: Vec3f | null;
}

class TransactionData extends DataType {
	public static override read(
		stream: BinaryStream,
		endian: Endianness,
		type: TransactionType,
	): TransactionDataEntry | null {
		// Check if the type is Normal or InventoryMismatch.
		if (type === TransactionType.Normal || type === TransactionType.InventoryMismatch) return null;

		// Check if the type is ItemUse.
		if (type === TransactionType.ItemUse) {
			// Read the data.
			const data = TransactionUseItem.read(stream);

			// Return the TransactionUseItemEntry.
			return {
				headPosition: null,
				entityRuntimeId: null,
				...data,
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
				...data,
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
				...data,
			};
		}

		return null;
	}

	public static override write(stream: BinaryStream, value: TransactionDataEntry): void {}
}

export { TransactionData, type TransactionDataEntry };
