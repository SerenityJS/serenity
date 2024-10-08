import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * @remarks This is a custom tag that performs the same function as the ByteTag class.
 * A tag that contains a boolean value.
 */
class BoolTag extends NBTTag<boolean> {
	public static readonly type = Tag.Byte;

	public valueOf(snbt?: boolean): number | string {
		return snbt ? (this.value ? 1 : 0 + "b") : this.value ? 1 : 0;
	}

	/**
	 * Reads a boolean tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): BoolTag {
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
		return new BoolTag(name, value === 1);
	}

	/**
	 * Writes a boolean tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: BoolTag,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		stream.writeByte(tag.value ? 1 : 0);
	}
}

export { BoolTag };
