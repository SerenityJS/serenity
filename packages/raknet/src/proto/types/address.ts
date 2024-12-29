import type { RemoteInfo } from "node:dgram";
import type { BinaryStream } from "@serenityjs/binarystream";

import { DataType } from "./type";

/**
 * Represents an address data type.
 * Address is used when establishing a connection in RakNet.
 */
export class Address extends DataType {
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
			identifier.family === "IPv4" ? 4 : 6,
		);
	}

	/**
	 * Writes the Address data type to a binary stream.
	 * @param stream The binary stream to write to.
	 * @param value The value to write.
	 */
	public static write(stream: BinaryStream, value: Address): void {
		stream.writeUint8(value.version);
		if (value.version === 4) {
			const addressBits = value.address.split(".", 4);
			for (const bit of addressBits) {
				stream.writeUint8(Number.parseInt(bit, 10) ^ 0xff);
			}
			stream.writeUShort(value.port);
		} else if (value.version === 6) {
			stream.writeUShort(23);
			stream.writeUShort(value.port);
			stream.writeUint32(0);
			const addressParts = value.address.split(":");
			for (const part of addressParts) {
				const num = Number.parseInt(part, 16);
				stream.writeUShort(num ^ 0xffff);
			}
			stream.writeUint32(0);
		}
	}

	/**
	 * Reads the Address data type from a binary stream.
	 * @param stream The binary stream to read from.
	 * @returns The Address data type.
	 */
	public static read(stream: BinaryStream): Address {
		const version = stream.readUint8();
		if (version === 4) {
			const bytes = stream.read(4);
			const address = bytes.map((byte) => (byte ^ 0xff).toString()).join(".");
			const port = stream.readUShort();
			return new Address(address, port, version);
		}
		if (version === 6) {
			stream.skip(2);
			const port = stream.readUShort();
			stream.skip(4);
			const addressParts = [];
			for (let i = 0; i < 8; i++) {
				const part = stream.readUShort() ^ 0xffff;
				addressParts.push(part.toString(16).padStart(4, "0"));
			}
			const address = addressParts.join(":");
			stream.skip(4);
			return new Address(address, port, version);
		}
		return new Address("", 0, 0);
	}
}
