/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Tag } from "../named-binary-tag";

import { NBTTag } from "./tag";
import { NBT_TAGS } from "./tags";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * A tag that contains a compound list value.
 */
class CompoundTag<T = unknown> extends NBTTag<T> {
	public static readonly type = Tag.Compound;

	/**
	 * Creates a new compound tag.
	 *
	 * @param name The name of the tag.
	 * @param value The value of the tag.
	 * @returns A new compound tag.
	 */
	public addTag<T>(...tags: Array<NBTTag<T>>): this {
		// Iterate over the tags.
		for (const tag of tags) {
			// Add the tag to the value.
			(this.value as Record<string, NBTTag<unknown>>)[tag.name] = tag;
		}

		return this;
	}

	/**
	 * Removes a tag from the compound tag.
	 *
	 * @param name The name of the tag to remove.
	 */
	public removeTag(name: string): this {
		delete (this.value as Record<string, NBTTag<unknown>>)[name];

		return this;
	}

	/**
	 * Returns a tag from the compound tag.
	 *
	 * @param name The name of the tag to get.
	 * @returns The tag that was found.
	 */
	public getTag<T>(name: string): NBTTag<T> | undefined {
		return (this.value as Record<string, NBTTag<T>>)[name];
	}

	/**
	 * Returns a tag from the compound tag.
	 *
	 * @param name The name of the tag to get.
	 * @returns The tag that was found.
	 */
	public hasTag(name: string): boolean {
		return name in (this.value as Record<string, NBTTag<unknown>>);
	}

	/**
	 * Sets a tag in the compound tag.
	 *
	 * @param name The name of the tag to set.
	 * @param tag The tag to set.
	 */
	public setTag<T>(name: string, tag: NBTTag<T>): this {
		(this.value as Record<string, NBTTag<T>>)[name] = tag;

		return this;
	}

	/**
	 * Returns all the tags in the compound tag.
	 *
	 * @returns All the tags in the compound tag.
	 */
	public getTags<T>(): Array<NBTTag<T>> {
		return Object.values(this.value as Record<string, NBTTag<T>>);
	}

	/**
	 * Returns all the names of the tags in the compound tag.
	 * @returns All the names of the tags in the compound tag.
	 */
	public clear(): this {
		for (const key in this.value) {
			delete this.value[key];
		}

		return this;
	}

	public valueOf<K = unknown>(snbt?: boolean): K | string {
		if (snbt) {
			const value: Record<string, string> = {};

			for (const key in this.value) {
				value[key] =
					this.value[key] instanceof CompoundTag
						? JSON.parse(
								(this.value as Record<string, NBTTag<T>>)[key]!.valueOf(
									true
								) as string
							)
						: (this.value as Record<string, NBTTag<T>>)[key]!.valueOf(true);
			}

			return JSON.stringify(value);
		} else {
			const value: Record<string, T> = {};

			for (const key in this.value) {
				value[key] = this.value[key]!.valueOf() as T;
			}

			return value as unknown as K;
		}
	}

	/**
	 * Reads a compound tag from the stream.
	 */
	public static read<T = unknown>(
		stream: BinaryStream,
		varint = false,
		type = true
	): CompoundTag<T> {
		// Check if the type should be read.
		if (type) {
			// Read the type.
			// And check if the type is a compound.
			const type = stream.readByte();
			if (type !== this.type) {
				throw new Error(`Expected tag type to be ${this.type} but got ${type}`);
			}
		}

		// Read the name.
		const name = this.readString(stream, varint);

		// Create the value.
		const value: Record<string, NBTTag<T>> = {};

		// Read the tags.
		do {
			// Read the type.
			const type = stream.readByte() as Tag;

			// Check if the tag was end.
			if (type === Tag.End) break;

			// Find the tag.
			const reader = NBT_TAGS.find((tag) => tag.type === type) as typeof NBTTag;

			// Check if the tag was found.
			if (!reader) {
				throw new Error(`Unknown tag type: ${type} at ${stream.offset}`);
			}

			// Read the tag.
			const read = reader.read(stream, varint, false);

			// Add the tag to the value.
			value[read.name] = read as NBTTag<T>;
		} while (!stream.cursorAtEnd());

		// Return the tag.
		return new CompoundTag(name, value as T);
	}

	/**
	 * Writes a compound tag to the stream.
	 */
	public static write<T = unknown>(
		stream: BinaryStream,
		tag: CompoundTag<T>,
		varint = false,
		type = true
	): void {
		// Check if the type should be written.
		if (type === true) {
			// Write the type.
			stream.writeByte(this.type);

			// Write the name.
			this.writeString(tag.name, stream, varint);
		}

		// Write the tags.
		for (const key in tag.value) {
			// Get the type.
			const type = tag.value[key] as NBTTag<unknown>;

			// Find the tag.
			const writter = NBT_TAGS.find(
				(tag) => type instanceof tag
			) as typeof NBTTag;

			// Check if the tag was found.
			if (!writter) {
				throw new Error(`Unknown tag type: ${type}`);
			}

			// Write the tag.
			writter.write(stream, type, varint);
		}

		// Write the end.
		stream.writeByte(Tag.End);
	}
}

export { CompoundTag };
