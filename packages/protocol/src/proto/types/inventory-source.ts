import { DataType } from "@serenityjs/raknet";

import { type ContainerId, InventorySourceType } from "../../enums";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents the source of an inventory action.
 */
class InventorySource extends DataType {
	/**
	 * The source type of the inventory action.
	 */
	public readonly type: InventorySourceType;

	/**
	 * The container id of the inventory source.
	 * If the source type is not ContainerInventory, then this value will not be present.
	 */
	public readonly containerId: ContainerId | null;

	/**
	 * The bit flags of the inventory source.
	 * If the source type is not GlobalInteraction, then this value will not be present.
	 */
	public readonly bitFlags: number | null;

	/**
	 * Creates an instance of InventorySource.
	 *
	 * @param type The source type of the inventory action.
	 * @param containerId The container id of the inventory source.
	 * @param bitFlags The bit flags of the inventory source.
	 */
	public constructor(
		type: InventorySourceType,
		containerId?: ContainerId | null,
		bitFlags?: number | null
	) {
		super();
		this.type = type;
		this.containerId = containerId ?? null;
		this.bitFlags = bitFlags ?? null;
	}

	public static read(stream: BinaryStream): InventorySource {
		// Read the type of the inventory source
		const type = stream.readVarInt();

		// Initialize the containerId and bitFlags variables
		let containerId: ContainerId | null = null;
		let bitFlags: number | null = null;
		// Switch the type of the inventory source
		switch (type) {
			// If the type is 0 (ContainerInventory) then read the containerId
			case InventorySourceType.ContainerInventory: {
				containerId = stream.readVarInt();
				break;
			}

			// If the type is 2 (GlobalInteraction) then read the bitFlags
			case InventorySourceType.WorldInteraction: {
				bitFlags = stream.readVarInt();
				break;
			}

			case InventorySourceType.CreativeInventory: {
				break;
			}

			//If the type has not been implemented yet, throw an error
			default: {
				throw new Error(
					`Unknown/not implemented inventory source type: ${type}`
				);
			}
		}

		// Return the new InventorySource instance
		return new InventorySource(type, containerId, bitFlags);
	}

	public static write(stream: BinaryStream, value: InventorySource): void {
		// Write the type of the inventory source
		stream.writeVarInt(value.type);

		// Switch the type of the inventory source
		switch (value.type) {
			// If the type is 0 (ContainerInventory) then write the containerId
			case InventorySourceType.ContainerInventory: {
				// Check if the containerId is null
				if (value.containerId === null) {
					throw new Error(
						"ContainerInventory type must have a containerId value"
					);
				}

				// Write the containerId value
				stream.writeVarInt(value.containerId);
				break;
			}

			// If the type is 2 (GlobalInteraction) then write the bitFlags
			case InventorySourceType.WorldInteraction: {
				// Check if the bitFlags is null
				if (value.bitFlags === null) {
					throw new Error("WorldInteraction type must have a bitFlags value");
				}

				// Write the bitFlags value
				stream.writeVarInt(value.bitFlags);
				break;
			}

			//If the type has not been implemented yet, throw an error
			default: {
				throw new Error(
					`Unknown/not implemented inventory source type: ${value.type}`
				);
			}
		}
	}
}

export { InventorySource };
