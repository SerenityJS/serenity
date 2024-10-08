import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

/**
 * A tag that contains a byte list value.
 */
class ByteListTag extends NBTTag<Array<number>> {
	public static readonly type = Tag.ByteList;

	/**
	 * Reads a byte list tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): ByteListTag {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a byte list.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the length.
		const length = varint
			? stream.readVarInt()
			: stream.readInt32(Endianness.Little);

		// Read the value.
		const value = stream.read(length);

		// Return the tag.
		return new ByteListTag(name, value);
	}

	/**
	 * Writes a byte list tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: ByteListTag,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the length.
		varint
			? stream.writeVarInt(tag.value.length)
			: stream.writeInt32(tag.value.length, Endianness.Little);

		// Write the value.
		stream.write(tag.value);
	}
}

export { ByteListTag };
