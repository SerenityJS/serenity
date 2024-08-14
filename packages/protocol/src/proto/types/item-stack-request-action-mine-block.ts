import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionMineBlock extends DataType {
	/**
	 * The slot of the item stack request action.
	 */
	public readonly slot: number;

	/**
	 * The predicted durability of the item stack request action.
	 */
	public readonly predictedDurability: number;

	/**
	 * The network id of the block of the item stack request action.
	 */
	public readonly networkId: number;

	/**
	 * Creates a new instance of ItemStackRequestActionMineBlock.
	 * @param slot - The slot of the item stack request action.
	 * @param predictedDurability - The predicted durability of the item stack request action.
	 * @param networkId - The network id of the block of the item stack request action.
	 */
	public constructor(
		slot: number,
		predictedDurability: number,
		networkId: number
	) {
		super();
		this.slot = slot;
		this.predictedDurability = predictedDurability;
		this.networkId = networkId;
	}

	public static read(stream: BinaryStream): ItemStackRequestActionMineBlock {
		// Read the slot.
		const slot = stream.readZigZag();

		// Read the predicted durability.
		const predictedDurability = stream.readZigZag();

		// Read the network id.
		const networkId = stream.readZigZag();

		// Return the item stack request action.
		return new this(slot, predictedDurability, networkId);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionMineBlock
	): void {
		// Write the slot.
		stream.writeZigZag(value.slot);

		// Write the predicted durability.
		stream.writeZigZag(value.predictedDurability);

		// Write the network id.
		stream.writeZigZag(value.networkId);
	}
}

export { ItemStackRequestActionMineBlock };
