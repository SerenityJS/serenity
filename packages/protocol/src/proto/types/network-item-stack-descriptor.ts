import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binaryutils";

import { ItemInstanceUserData } from "./item-instance-user-data";

class NetworkItemStackDescriptor extends DataType {
	public network: number;
	public stackSize?: number;
	public metadata?: number;
	public stackNetId?: number | null;
	public blockRuntimeId?: number;
	public extras?: ItemInstanceUserData | null;

	/**
	 * Creates an instance of NetworkItemStackDescriptor.
	 * @param id The network id of the item.
	 * @param stackSize The size of the stack.
	 * @param metadata The metadata of the item.
	 * @param includeStackNetId Whether to include the stack net id.
	 * @param auxValue The aux value of the item.
	 * @param userData The user data of the item.
	 */
	public constructor(
		network: number,
		stackSize?: number,
		metadata?: number,
		stackNetId?: number | null,
		blockRuntimeId?: number,
		extras?: ItemInstanceUserData | null
	) {
		super();
		this.network = network;
		this.stackSize = stackSize;
		this.metadata = metadata;
		this.stackNetId = stackNetId;
		this.blockRuntimeId = blockRuntimeId;
		this.extras = extras;
	}

	public static read(stream: BinaryStream): NetworkItemStackDescriptor {
		// Read the network id of the item.
		const network = stream.readZigZag();

		// Check if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (network === 0) return new NetworkItemStackDescriptor(network);

		// Read the remaining fields of the item.
		const stackSize = stream.readUint16(Endianness.Little);
		const metadata = stream.readVarInt();

		// Check if the stack net id should be included.
		const stackNetId = stream.readBool() ? stream.readVarInt() : null;

		// Read the block runtime id.
		const blockRuntimeId = stream.readZigZag();

		// Check if the item has extra data.
		const length = stream.readVarInt();

		// The length will indicate if extra data is present.
		// If it is, we read the extra data.
		const extras =
			length > 0
				? ItemInstanceUserData.read(stream, Endianness.Little, network)
				: null;

		// Return the item instance descriptor.
		return new NetworkItemStackDescriptor(
			network,
			stackSize,
			metadata,
			stackNetId,
			blockRuntimeId,
			extras
		);
	}

	public static write(
		stream: BinaryStream,
		value: NetworkItemStackDescriptor
	): void {
		// Write the network id of the item.
		stream.writeZigZag(value.network);

		// Check if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (value.network === 0) return;

		// Write the remaining fields of the item.
		stream.writeUint16(value.stackSize ?? 0, Endianness.Little);
		stream.writeVarInt(value.metadata ?? 0);

		// Check if the stack net id should be included.
		if (value.stackNetId) {
			// Write a boolean to indicate that the stack net id is included.
			// Then write the stack net id.
			stream.writeBool(true);
			stream.writeVarInt(value.stackNetId);
		} else {
			// Write a boolean to indicate that the stack net id is not included.
			stream.writeBool(false);
		}

		// Write the block runtime id.
		stream.writeZigZag(value.blockRuntimeId ?? 0);

		// Check if the item has extra data.
		// If it does, we need to first create a new stream,
		// And then write the extra data to the stream.
		// We then write the length of the stream to the main stream, and then write the stream.
		if (value.extras) {
			// Create a new stream for the extra data.
			const extras = new BinaryStream();

			// Write the extra data to the stream.
			ItemInstanceUserData.write(
				extras,
				value.extras,
				Endianness.Little,
				value.network
			);

			// Write the length of the extra data to the main stream.
			stream.writeVarInt(extras.binary.length);

			// Write the extra data to the main stream.
			stream.write(extras.binary);
		} else {
			// Write 0 to the main stream, since there is no extra data.
			stream.writeVarInt(0);
		}
	}
}

export { NetworkItemStackDescriptor };
