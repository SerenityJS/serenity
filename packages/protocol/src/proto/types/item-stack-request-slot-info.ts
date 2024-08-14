import { DataType } from "@serenityjs/raknet";

import { FullContainerName } from "./full-container-name";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestSlotInfo extends DataType {
	/**
	 * The container of the stack request slot info.
	 */
	public readonly container: FullContainerName;

	/**
	 * The slot of the stack request slot info.
	 */
	public readonly slot: number;

	/**
	 * The stack id of the stack request slot info.
	 */
	public readonly stackId: number;

	/**
	 * Creates a new instance of ItemStackRequestSlotInfo.
	 * @param container - The container of the stack request slot info.
	 * @param slot - The slot of the stack request slot info.
	 * @param stackId - The stack id of the stack request slot info.
	 */
	public constructor(
		container: FullContainerName,
		slot: number,
		stackId: number
	) {
		super();
		this.container = container;
		this.slot = slot;
		this.stackId = stackId;
	}

	public static read(stream: BinaryStream): ItemStackRequestSlotInfo {
		// Read the container of the stack request slot info.
		const container = FullContainerName.read(stream);

		// Read the slot.
		const slot = stream.readUint8();

		// Read the stack id.
		const stackId = stream.readZigZag();

		// Return the stack request slot info.
		return new ItemStackRequestSlotInfo(container, slot, stackId);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestSlotInfo
	): void {
		// Write the type.
		FullContainerName.write(stream, value.container);

		// Write the slot.
		stream.writeUint8(value.slot);

		// Write the stack id.
		stream.writeZigZag(value.stackId);
	}
}

export { ItemStackRequestSlotInfo };
