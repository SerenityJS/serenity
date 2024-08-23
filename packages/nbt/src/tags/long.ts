import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

/**
 * A tag that contains a long value.
 */
class LongTag extends NBTTag<bigint> {
	public static readonly type = Tag.Long;

	public valueOf(snbt?: boolean): bigint | string {
		return snbt ? this.value + "l" : this.value;
	}

	/**
	 * Reads a long tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): LongTag {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a long.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the value.
		const value = varint
			? stream.readVarLong()
			: stream.readLong(Endianness.Little);

		// Return the tag.
		return new LongTag(name, value);
	}

	/**
	 * Writes a long tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: LongTag,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		varint
			? stream.writeVarLong(tag.value)
			: stream.writeLong(tag.value, Endianness.Little);
	}
}

export { LongTag };
