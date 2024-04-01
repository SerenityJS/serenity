import { BinaryStream } from "@serenityjs/binaryutils";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

/**
 * A tag that contains a byte value.
 */
class ByteTag<T extends number = number> extends NBTTag<T> {
	public static readonly type = Tag.Byte;

	public valueOf(snbt?: boolean): number | string {
		return snbt ? this.value + "b" : this.value;
	}

	/**
	 * Reads a byte tag from the stream.
	 */
	public static read<T extends number>(
		stream: BinaryStream,
		varint = false,
		type = true
	): ByteTag<T> {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a byte.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the value.
		const value = stream.readByte();

		// Return the tag.
		return new ByteTag<T>(name, value as T);
	}

	/**
	 * Writes a byte tag to the stream.
	 */
	public static write<T extends number>(
		stream: BinaryStream,
		tag: ByteTag<T>,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		stream.writeByte(tag.value);
	}
}

export { ByteTag };
