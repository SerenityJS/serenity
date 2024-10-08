/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";
import { CompoundTag } from "./compound";
import { NBT_TAGS } from "./tags";
import { ByteTag } from "./byte";
import { ShortTag } from "./short";
import { IntTag } from "./int";
import { LongTag } from "./long";
import { FloatTag } from "./float";
import { DoubleTag } from "./double";
import { StringTag } from "./string";

/**
 * A tag that contains a list value.
 */
class ListTag<T = unknown> extends NBTTag<Array<T>> {
	public static readonly type = Tag.List;

	public readonly type: Tag;

	public constructor(name: string, value: Array<T>, type: Tag) {
		super(name, value);
		this.type = type;
	}

	public valueOf(snbt?: boolean): string | unknown {
		if (snbt) {
			const values: Array<string> = [];

			for (const key in this.value) {
				values.push(this.value[key]!.valueOf() + "");
			}

			return JSON.stringify(values);
		} else {
			const values: Array<T> = [];

			for (const key in this.value) {
				values.push(this.value[key]!.valueOf() as T);
			}

			return values;
		}
	}

	/**
	 * Pushes a value to the list.
	 */
	public push(...value: Array<T>): void {
		this.value.push(...value);
	}

	/**
	 * Removes a value from the list.
	 */
	public remove(index: number): void {
		this.value.splice(index, 1);
	}

	/**
	 * Reads a list tag from the stream.
	 */
	public static read(
		stream: BinaryStream,
		varint = false,
		type = true
	): ListTag<NBTTag> {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a list.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Find the reader for the type.
		const tag = stream.readByte() as Tag;

		// Read the length.
		const length = varint
			? stream.readZigZag()
			: stream.readInt32(Endianness.Little);

		// Prepare the an array to store the values.
		const values: Array<NBTTag> = [];

		// Read the values.
		for (let index = 0; index < length; index++) {
			// Switch to the correct tag type
			switch (tag) {
				default: {
					throw new Error(
						`Tag type '${Tag[tag]}' has not been implemented for ListTag. ${stream.offset}`
					);
				}

				case Tag.Byte: {
					values.push(new ByteTag("", stream.readByte()));
					break;
				}

				case Tag.Short: {
					values.push(new ShortTag("", stream.readInt16(Endianness.Little)));
					break;
				}

				case Tag.Int: {
					values.push(
						varint
							? new IntTag("", stream.readVarInt())
							: new IntTag("", stream.readInt32(Endianness.Little))
					);
					break;
				}

				case Tag.Long: {
					values.push(
						varint
							? new LongTag("", stream.readVarLong())
							: new LongTag("", stream.readLong(Endianness.Little))
					);
					break;
				}

				case Tag.Float: {
					values.push(new FloatTag("", stream.readFloat32(Endianness.Little)));
					break;
				}

				case Tag.Double: {
					values.push(new DoubleTag("", stream.readFloat64(Endianness.Little)));
					break;
				}

				case Tag.String: {
					values.push(new StringTag("", this.readString(stream, varint)));
					break;
				}

				case Tag.Compound: {
					const value: Record<string, unknown> = {};

					// Read the tags.
					do {
						// Read the type.
						const type = stream.readByte() as Tag;

						// Check if the tag was end.
						if (type === Tag.End) break;

						// Find the tag.
						const reader = NBT_TAGS.find(
							(tag) => tag.type === type
						) as typeof NBTTag;

						// Check if the tag was found.
						if (!reader) {
							throw new Error(`Unknown tag type: ${type} at ${stream.offset}`);
						}

						// Read the tag.
						const read = reader.read(stream, varint, false);

						// Add the tag to the value.
						value[read.name] = read as unknown;
					} while (!stream.cursorAtEnd());

					values.push(new CompoundTag("", value));
				}
			}
		}

		// Return the tag.
		return new ListTag(name, values, tag);
	}

	/**
	 * Writes a list tag to the stream.
	 */
	public static write(
		stream: BinaryStream,
		tag: ListTag<NBTTag>,
		varint = false
	): void {
		// Write the type.
		stream.writeByte(this.type);

		// Write the name.
		this.writeString(tag.name, stream, varint);

		// Write the type of the list.
		stream.writeByte(tag.type);

		// Write the length.
		varint
			? stream.writeZigZag(tag.value.length)
			: stream.writeInt32(tag.value.length, Endianness.Little);

		// Write the values.
		for (const value of tag.value) {
			// Switch to the correct tag type
			switch (tag.type) {
				default: {
					throw new Error(
						`Tag type '${Tag[tag.type]}' has not been implemented for ListTag.`
					);
				}

				case Tag.Byte: {
					stream.writeByte(value.value as number);
					break;
				}

				case Tag.Short: {
					stream.writeInt16(value.value as number, Endianness.Little);
					break;
				}

				case Tag.Int: {
					varint
						? stream.writeVarInt(value.value as number)
						: stream.writeInt32(value.value as number, Endianness.Little);
					break;
				}

				case Tag.Long: {
					varint
						? stream.writeVarLong(value.value as bigint)
						: stream.writeLong(value.value as bigint, Endianness.Little);
					break;
				}

				case Tag.Float: {
					stream.writeFloat32(value.value as number, Endianness.Little);
					break;
				}

				case Tag.Double: {
					stream.writeFloat64(value.value as number, Endianness.Little);
					break;
				}

				case Tag.String: {
					this.writeString(value.value as string, stream, varint);
					break;
				}

				case Tag.Compound: {
					const compound = value as CompoundTag<Record<string, NBTTag>>;

					// Write the tags.
					for (const tag of compound.getTags()) {
						// Find the tag.
						const writter = NBT_TAGS.find(
							(x) => tag instanceof x
						) as typeof NBTTag;

						// Check if the tag was found.
						if (!writter) {
							throw new Error(`Unknown tag type for: ${tag.name}`);
						}

						// Write the tag.
						writter.write(stream, tag, varint);
					}

					// Write the end tag.
					stream.writeByte(Tag.End);
					break;
				}
			}
		}
	}
}

export { ListTag };
