import { BinaryStream } from "@serenityjs/binaryutils";

import { DataType } from "./type";

const MagicBuffer = Buffer.from(
	"\u0000\u00FF\u00FF\u0000\u00FE\u00FE\u00FE\u00FE\u00FD\u00FD\u00FD\u00FD\u0012\u0034\u0056\u0078",
	"binary"
);

/**
 * Represents a magic data type.
 * Magic is used when establishing a connection in RakNet.
 */
class Magic extends DataType {
	/**
	 * Reads the magic data type from a binary stream.
	 * @param stream The binary stream to read from.
	 * @returns The magic data type.
	 */
	public static read(stream: BinaryStream): Buffer {
		return stream.readBuffer(MagicBuffer.length);
	}

	/**
	 * Writes the magic data type to a binary stream.
	 * @param stream The binary stream to write to.
	 */
	public static write(stream: BinaryStream): void {
		stream.writeBuffer(MagicBuffer);
	}
}

export { Magic };
