import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

/**
 * A tag that contains a short value.
 */
class ShortTag extends NBTTag<number> {
	public static readonly type = Tag.Short;

	public valueOf(snbt?: boolean): number | string {
		return snbt ? this.value + "s" : this.value;
	}

	/**
	 * Reads a short tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): ShortTag {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a short.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the value.
		const value = stream.readShort(Endianness.Little);

		// Return the tag.
		return new ShortTag(name, value);
	}

	/**
	 * Writes a short tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: ShortTag,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		stream.writeShort(tag.value, Endianness.Little);
	}
}

export { ShortTag };
