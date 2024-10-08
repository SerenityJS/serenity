import {
	BinaryStream,
	Endianness,
	Uint16,
	VarInt
} from "@serenityjs/binarystream";

import {
	ByteTag,
	CompoundTag,
	DoubleTag,
	FloatTag,
	IntTag,
	ListTag,
	LongTag,
	type NBTTag,
	ShortTag,
	StringTag
} from "./tags";

enum Tag {
	End = 0x00,
	Byte = 0x01,
	Short = 0x02,
	Int = 0x03,
	Long = 0x04,
	Float = 0x05,
	Double = 0x06,
	ByteList = 0x07,
	String = 0x08,
	List = 0x09,
	Compound = 0x0a,
	IntList = 0x0b,
	LongList = 0x0c
}

export { Tag };

class NamedBinaryTag extends BinaryStream {
	public readonly varint: boolean;
	protected readonly length: typeof VarInt | typeof Uint16;

	public constructor(buffer?: Buffer, varint = false) {
		super(buffer);
		this.varint = varint;
		this.length = varint ? VarInt : Uint16;
	}

	protected readLength(): number {
		return this.length.read(this, Endianness.Little);
	}

	protected writeLength(value: number): void {
		this.length.write(this, value, Endianness.Little);
	}

	public readString(): string {
		// Read the length of the string.
		const length = this.readLength();
		const buffer = this.readBuffer(length);

		// Convert the buffer to a string.
		return String.fromCodePoint(...buffer);
	}

	public writeString(value: string): void {
		// Convert the string to a buffer.
		const buffer = Buffer.from(value);

		// Write the length of the string.
		this.writeLength(buffer.length);
		this.writeBuffer(buffer);
	}

	/**
	 * Reads a tag from the stream.
	 * @returns The tag that was read.
	 */
	public readByteTag(): ByteTag {
		return ByteTag.read(this);
	}

	/**
	 * Writes a tag to the stream.
	 * @param tag The tag to write.
	 */
	public writeByteTag(tag: ByteTag): void {
		ByteTag.write(this, tag);
	}

	/**
	 * Reads a tag from the stream.
	 * @returns The tag that was read.
	 */
	public readShortTag(): ShortTag {
		return ShortTag.read(this);
	}

	/**
	 * Writes a tag to the stream.
	 * @param tag The tag to write.
	 */
	public writeShortTag(tag: ShortTag): void {
		ShortTag.write(this, tag);
	}

	public readIntTag(): IntTag {
		return IntTag.read(this);
	}

	public writeIntTag(tag: IntTag): void {
		IntTag.write(this, tag);
	}

	public readLongTag(): LongTag {
		return LongTag.read(this);
	}

	public writeLongTag(tag: LongTag): void {
		LongTag.write(this, tag);
	}

	public readFloatTag(): FloatTag {
		return FloatTag.read(this);
	}

	public writeFloatTag(tag: FloatTag): void {
		FloatTag.write(this, tag);
	}

	public readDoubleTag(): DoubleTag {
		return DoubleTag.read(this);
	}

	public writeDoubleTag(tag: DoubleTag): void {
		DoubleTag.write(this, tag);
	}

	public readStringTag(): StringTag {
		return StringTag.read(this);
	}

	public writeStringTag(tag: StringTag): void {
		StringTag.write(this, tag);
	}

	public readCompoundTag<T = unknown>(): CompoundTag<T> {
		return CompoundTag.read<T>(this);
	}

	public writeCompoundTag<T = unknown>(tag: CompoundTag<T>): void {
		CompoundTag.write<T>(this, tag);
	}

	public readListTag(): ListTag {
		return ListTag.read(this);
	}

	public writeListTag(tag: ListTag<NBTTag>): void {
		ListTag.write(this, tag);
	}
}

export { NamedBinaryTag };
