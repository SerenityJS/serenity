import { DataType } from "./type";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents a maximum transmission unit data type.
 * MTU is used when establishing a connection in RakNet.
 */
class MTU extends DataType {
	/**
	 * Reads the mtu data type from a binary stream.
	 * @param stream The binary stream to read from.
	 * @returns The mtu data type.
	 */
	public static read(stream: BinaryStream): number {
		return stream.getBuffer().byteLength;
	}

	/**
	 * Writes the mtu data type to a binary stream.
	 * @param stream The binary stream to write to.
	 * @param value The value to write.
	 */
	public static write(stream: BinaryStream, value: number): void {
		stream.writeBuffer(Buffer.alloc(value - stream.getBuffer().length));
	}
}

export { MTU };
