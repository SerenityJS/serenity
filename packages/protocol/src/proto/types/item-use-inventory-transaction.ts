import { DataType } from "@serenityjs/raknet";

import { BlockCoordinates } from "./block-coordinates";
import { NetworkItemStackDescriptor } from "./network-item-stack-descriptor";
import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";
import type {
	BlockFace,
	ItemUseInventoryTransactionType,
	TriggerType
} from "../../enums";

/**
 * Represents an item use inventory transaction.
 */
class ItemUseInventoryTransaction extends DataType {
	/**
	 * The type of the item use inventory transaction.
	 */
	public readonly type: ItemUseInventoryTransactionType;

	/**
	 * The trigger type of the item use inventory transaction.
	 */
	public readonly triggerType: TriggerType;

	/**
	 * The block position of the item use inventory transaction.
	 */
	public readonly blockPosition: BlockCoordinates;

	/**
	 * The block face of the item use inventory transaction.
	 */
	public readonly face: BlockFace;

	/**
	 * The slot of the item use inventory transaction.
	 */
	public readonly slot: number;

	/**
	 * The item of the item use inventory transaction.
	 */
	public readonly item: NetworkItemStackDescriptor;

	/**
	 * The from position of the item use inventory transaction.
	 */
	public readonly fromPosition: Vector3f;

	/**
	 * The click position of the item use inventory transaction.
	 */
	public readonly clickPosition: Vector3f;

	/**
	 * The network block id of the item use inventory transaction.
	 */
	public readonly networkBlockId: number;

	/**
	 * Whether or not the transaction is an initial transaction.
	 */
	public readonly intialTransaction: boolean;

	/**
	 * Creates an instance of ItemUseInventoryTransaction.
	 *
	 * @param type The type of the item use inventory transaction.
	 * @param triggerType The trigger type of the item use inventory transaction.
	 * @param blockPosition The block position of the item use inventory transaction.
	 * @param face The block face of the item use inventory transaction.
	 * @param slot The slot of the item use inventory transaction.
	 * @param item The item of the item use inventory transaction.
	 * @param fromPosition The from position of the item use inventory transaction.
	 * @param clickPosition The click position of the item use inventory transaction.
	 * @param networkBlockId The network block id of the item use inventory transaction.
	 * @param initialTransaction Whether or not the transaction is an initial transaction.
	 */
	public constructor(
		type: ItemUseInventoryTransactionType,
		triggerType: TriggerType,
		blockPosition: BlockCoordinates,
		face: BlockFace,
		slot: number,
		item: NetworkItemStackDescriptor,
		fromPosition: Vector3f,
		clickPosition: Vector3f,
		networkBlockId: number,
		initialTransaction: boolean
	) {
		super();
		this.type = type;
		this.triggerType = triggerType;
		this.blockPosition = blockPosition;
		this.face = face;
		this.slot = slot;
		this.item = item;
		this.fromPosition = fromPosition;
		this.clickPosition = clickPosition;
		this.networkBlockId = networkBlockId;
		this.intialTransaction = initialTransaction;
	}

	public static read(stream: BinaryStream): ItemUseInventoryTransaction {
		// Read the type of the item use inventory transaction
		const type = stream.readVarInt() as ItemUseInventoryTransactionType;

		// Read the trigger type of the item use inventory transaction
		const triggerType = stream.readVarInt() as TriggerType;

		// Read the block position of the item use inventory transaction
		const blockPosition = BlockCoordinates.read(stream);

		// Read the face of the item use inventory transaction
		const face = stream.readZigZag();

		// Read the slot of the item use inventory transaction
		const slot = stream.readZigZag();

		// Read the item of the item use inventory transaction
		const item = NetworkItemStackDescriptor.read(stream);

		// Read the from position of the item use inventory transaction
		const fromPosition = Vector3f.read(stream);

		// Read the click position of the item use inventory transaction
		const clickPosition = Vector3f.read(stream);

		// Read the network block id of the item use inventory transaction
		const networkBlockId = stream.readZigZag();

		// Read whether or not the transaction is an initial transaction
		const initialTransaction = stream.readBool();

		// Return the new instance of ItemUseInventoryTransaction
		return new ItemUseInventoryTransaction(
			type,
			triggerType,
			blockPosition,
			face,
			slot,
			item,
			fromPosition,
			clickPosition,
			networkBlockId,
			initialTransaction
		);
	}

	public static write(
		stream: BinaryStream,
		value: ItemUseInventoryTransaction
	): void {
		// Write the type of the item use inventory transaction
		stream.writeVarInt(value.type);

		// Write the trigger type of the item use inventory transaction
		stream.writeVarInt(value.triggerType);

		// Write the block position of the item use inventory transaction
		BlockCoordinates.write(stream, value.blockPosition);

		// Write the face of the item use inventory transaction
		stream.writeZigZag(value.face);

		// Write the slot of the item use inventory transaction
		stream.writeZigZag(value.slot);

		// Write the item of the item use inventory transaction
		NetworkItemStackDescriptor.write(stream, value.item);

		// Write the from position of the item use inventory transaction
		Vector3f.write(stream, value.fromPosition);

		// Write the click position of the item use inventory transaction
		Vector3f.write(stream, value.clickPosition);

		// Write the network block id of the item use inventory transaction
		stream.writeZigZag(value.networkBlockId);

		// Write whether or not the transaction is an initial transaction
		stream.writeBool(value.intialTransaction);
	}
}

export { ItemUseInventoryTransaction };
