import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";

/**
 * A tag that contains a float value.
 */
class FloatTag extends NBTTag<number> {
	public static readonly type = Tag.Float;

	public valueOf(snbt?: boolean): number | string {
		return snbt ? this.value + "f" : this.value;
	}

	/**
	 * Reads a float tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): FloatTag {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a float.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Read the value.
		const value = stream.readFloat32(Endianness.Little);

		// Return the tag.
		return new FloatTag(name, value);
	}

	/**
	 * Writes a float tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: FloatTag,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the value.
		stream.writeFloat32(tag.value, Endianness.Little);
	}
}

export { FloatTag };
