import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

/**
 * A tag that contains a int value.
 */
class IntTag<T extends number = number> extends NBTTag<T> {
	public static readonly type = Tag.Int;

	public valueOf(snbt?: boolean): number | string {
		return snbt ? this.value + "i" : this.value;
	}

	/**
	 * Reads a int tag from the stream.
	 */
	public static read<T extends number = number>(
		stream: BinaryStream,
		varint = false,
		type = true
	): IntTag<T> {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a int.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the value.
		const value = varint
			? stream.readZigZag()
			: stream.readInt32(Endianness.Little);

		// Return the tag.
		return new IntTag(name, value as T);
	}

	/**
	 * Writes a int tag to the stream.
	 */
	public static write<T extends number = number>(
		stream: BinaryStream,
		tag: IntTag<T>,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		varint
			? stream.writeZigZag(tag.value)
			: stream.writeInt32(tag.value, Endianness.Little);
	}
}

export { IntTag };
