import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binaryutils";

import { ItemInstanceUserData } from "./item-instance-user-data";

class NetworkItemInstanceDescriptor extends DataType {
	public networkId: number;
	public stackSize?: number;
	public metadata?: number;
	public blockRuntimeId?: number;
	public extras?: ItemInstanceUserData | null;

	/**
	 * Creates an instance of NetworkItemInstanceDescriptor.
	 * @param id The network id of the item.
	 * @param stackSize The size of the stack.
	 * @param auxValue The aux value of the item.
	 * @param userData The user data of the item.
	 */
	public constructor(
		networkId: number,
		stackSize?: number,
		metadata?: number,
		blockRuntimeId?: number,
		extras?: ItemInstanceUserData | null
	) {
		super();
		this.networkId = networkId;
		this.stackSize = stackSize;
		this.metadata = metadata;
		this.blockRuntimeId = blockRuntimeId;
		this.extras = extras;
	}

	public static read(stream: BinaryStream): NetworkItemInstanceDescriptor {
		// Read the network id of the item.
		const networkId = stream.readZigZag();

		// Check if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (networkId === 0) return new NetworkItemInstanceDescriptor(networkId);

		// Read the remaining fields of the item.
		const stackSize = stream.readUint16(Endianness.Little);
		const metadata = stream.readVarInt();
		const blockRuntimeId = stream.readZigZag();

		// Check if the item has extra data.
		const length = stream.readVarInt();
		const extras =
			length > 0
				? ItemInstanceUserData.read(stream, Endianness.Little, networkId)
				: null;

		// Return the item instance descriptor.
		return new NetworkItemInstanceDescriptor(
			networkId,
			stackSize,
			metadata,
			blockRuntimeId,
			extras
		);
	}

	public static write(
		stream: BinaryStream,
		value: NetworkItemInstanceDescriptor
	): void {
		// Write the network id of the item.
		stream.writeZigZag(value.networkId);

		// Check if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (value.networkId === 0) return;

		// Write the remaining fields of the item.
		stream.writeUint16(value.stackSize ?? 0, Endianness.Little);
		stream.writeVarInt(value.metadata ?? 0);
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
				value.networkId
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

export { NetworkItemInstanceDescriptor };
