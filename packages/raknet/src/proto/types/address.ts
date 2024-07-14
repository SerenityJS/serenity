import { DataType } from "./type";

import type { RemoteInfo } from "node:dgram";
import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents an address data type.
 * Address is used when establishing a connection in RakNet.
 */
class Address extends DataType {
	/**
	 * The address of the data type.
	 */
	public address: string;

	/**
	 * The port of the data type.
	 */
	public port: number;

	/**
	 * The version of the data type.
	 */
	public version: number;

	/**
	 * Initializes a new instance of the Address data type.
	 * @param address The address of the data type.
	 * @param port The port of the data type.
	 * @param version The version of the data type.
	 */
	public constructor(address: string, port: number, version: number) {
		super();
		this.address = address;
		this.port = port;
		this.version = version;
	}

	/**
	 * Converts the Address data type to a NetworkIdentifier.
	 *
	 * @param identifier The NetworkIdentifier.
	 * @returns The NetworkIdentifier.
	 */
	public static fromIdentifier(identifier: RemoteInfo): Address {
		return new Address(
			identifier.address,
			identifier.port,
			identifier.family === "IPv4" ? 4 : 6
		);
	}

	/**
	 * Reads the Address data type from a binary stream.
	 * @param stream The binary stream to read from.
	 * @returns The Address data type.
	 */
	public static read(stream: BinaryStream): Address {
		// Read the version of the address.
		const version = stream.readUint8();

		// Check if the version is 4.
		if (version === 4) {
			// Read the address and port.
			const addressBuffer = stream.read(4);
			const address = addressBuffer.map((byte) => (-byte - 1) & 0xff).join(".");
			const port = stream.readUShort();

			// Return the address.
			return new Address(address, port, version);
		} else {
			stream.skip(2);
			const port = stream.readUShort();
			stream.skip(16);
			const addressBuffer = stream.read(4);
			const address = addressBuffer.filter((byte) => byte !== 0xff).join(".");
			stream.skip(4);

			// Return the address.
			return new Address(address, port, version);
		}
	}

	/**
	 * Writes the Address data type to a binary stream.
	 * @param stream The binary stream to write to.
	 * @param value The value to write.
	 */
	public static write(stream: BinaryStream, value: Address): void {
		// Separate the address, port, and version.
		const { address, port, version } = value;

		// Write the version of the address.
		stream.writeUint8(version);

		// Format the address and write it to the stream.
		const addressBits = address.split(".", 4);
		for (const bit of addressBits) {
			stream.writeUint8(Number(bit));
		}

		// Write the port to the stream.
		stream.writeUShort(port);
	}
}

export { Address };
