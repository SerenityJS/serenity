import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * A tag that contains a string value.
 */
class StringTag extends NBTTag<string> {
	public static readonly type = Tag.String;

	/**
	 * Reads a string tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): StringTag {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a string.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the value.
		const value = this.readString(stream, varint);

		// Return the tag.
		return new StringTag(name, value);
	}

	/**
	 * Writes a string tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: StringTag,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		this.writeString(tag.value, stream, varint);
	}
}

export { StringTag };
