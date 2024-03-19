import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binaryutils";

import { Tag } from "../named-binary-tag";

abstract class NBTTag<T = unknown> extends DataType {
	/**
	 * The type of the tag.
	 */
	public static readonly type: Tag;

	/**
	 * The name of the tag.
	 */
	public readonly name: string;

	/**
	 * The value of the tag.
	 */
	public readonly value: T;

	/**
	 * Creates a new NBTTag.
	 *
	 * @param name The name of the tag.
	 * @param value The value of the tag.
	 * @returns A new NBTTag.
	 */
	public constructor(name: string, value: T) {
		super();
		this.name = name;
		this.value = value;
	}

	/**
	 * Returns the value of the tag.
	 *
	 * @returns The value of the tag.
	 */
	public valueOf(_snbt?: boolean): string | unknown {
		return this.value as unknown;
	}

	/**
	 * Reads a tag from the stream.
	 *
	 * @param _stream The stream to read from.
	 * @param _type Whether or not to read the type of the tag.
	 * @returns The tag that was read.
	 */
	public static read(
		_stream: BinaryStream,
		_type: unknown,
		_varint: unknown
	): typeof this.prototype {
		throw new Error("NBTTag.read() is not implemented.");
	}

	/**
	 * Writes a tag to the stream.
	 *
	 * @param _stream The stream to write to.
	 */
	public static write(
		_stream: BinaryStream,
		_tag: NBTTag<unknown>,
		_varint: unknown
	): void {
		throw new Error("NBTTag.write() is not implemented.");
	}

	protected static readString(stream: BinaryStream, varint = false): string {
		// Read the length of the string.
		const length = varint
			? stream.readVarInt()
			: stream.readShort(Endianness.Little);
		const buffer = stream.readBuffer(length);

		// Convert the buffer to a string.
		return String.fromCodePoint(...buffer);
	}

	protected static writeString(
		value: string,
		stream: BinaryStream,
		varint = false
	): void {
		// Convert the string to a buffer.
		const buffer = Buffer.from(value);

		// Write the length of the string.
		varint
			? stream.writeVarInt(buffer.length)
			: stream.writeShort(buffer.length, Endianness.Little);

		// Write the buffer.
		stream.writeBuffer(buffer);
	}
}

export { NBTTag };
