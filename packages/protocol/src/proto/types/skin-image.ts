import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

/**
 * Represents a skin related image.
 */
class SkinImage extends DataType {
	/**
	 * The width of the image.
	 */
	public readonly width: number;

	/**
	 * The height of the image.
	 */
	public readonly height: number;

	/**
	 * The data of the image.
	 */
	public readonly data: Buffer;

	/**
	 * Creates a new skin image.
	 *
	 * @param width The width of the image.
	 * @param height The height of the image.
	 * @param data The data of the image.
	 */
	public constructor(width: number, height: number, data: Buffer) {
		super();
		this.width = width;
		this.height = height;
		this.data = data;
	}

	public static read(stream: BinaryStream): SkinImage {
		// Read the width, height and data of the image.
		const width = stream.readUint32(Endianness.Little);
		const height = stream.readUint32(Endianness.Little);
		const length = stream.readVarInt();
		const buffer = stream.readBuffer(length);

		// Return the new skin image.
		return new SkinImage(width, height, buffer);
	}

	public static write(stream: BinaryStream, image: SkinImage): void {
		// Write the width, height and data of the image.
		stream.writeUint32(image.width, Endianness.Little);
		stream.writeUint32(image.height, Endianness.Little);
		stream.writeVarInt(image.data.length);
		stream.writeBuffer(image.data);
	}
}

export { SkinImage };
