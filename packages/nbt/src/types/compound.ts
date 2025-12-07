import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import { ByteTag } from "./byte";
import { BaseTag } from "./base-tag";
import { ReadWriteOptions } from "./read-write-options";
import { ShortTag } from "./short";
import { IntTag } from "./int";
import { LongTag } from "./long";
import { FloatTag } from "./float";
import { DoubleTag } from "./double";
import { StringTag } from "./string";
import { ListTag } from "./list";
import { ByteListTag } from "./byte-list";

class CompoundTag extends Map<string, BaseTag> implements BaseTag {
  public readonly type = TagType.Compound;

  public name: string | null;

  /**
   * Create a new CompoundTag instance.
   * @param name The name of the tag, defaults to null.
   */
  public constructor(name?: string | null) {
    super();
    this.name = name ?? null;
  }

  public toJSON<T = Record<string, unknown>>(): T {
    // Convert the map to a JSON object.
    const json: Record<string, unknown> = {};

    // Iterate over each tag in the compound tag.
    for (const [key, value] of this) {
      // Add the tag to the JSON object using its key.
      json[key] = value.toJSON();
    }

    // Return the JSON object.
    return json as T;
  }

  /**
   * Get a nbt tag by its key.
   * @param key The key of the tag to retrieve.
   * @returns The tag associated with the key, or undefined if not found.
   */
  public get<T extends BaseTag>(key: string): T | undefined {
    // Call the original get method from Map and cast the result to T.
    return super.get(key) as T | undefined;
  }

  /**
   * Set a nbt tag with a specific key.
   * @param key The key to associate with the tag.
   * @param value The tag to set.
   * @returns The current instance for method chaining.
   */
  public set<T extends BaseTag>(key: string, value: T): this {
    // Set the name of the tag to the key.
    value.name = key;

    // Call the original set method from Map.
    super.set(key, value);

    // Return the current instance for method chaining.
    return this;
  }

  /**
   * Add multiple tags to the compound tag.
   * @param tags An array of tags to add.
   * @returns The current instance for method chaining.
   */
  public push<T extends BaseTag>(...tags: Array<T>): this {
    // Iterate over each tag in the provided array.
    for (const tag of tags) {
      // Set the tag in the map using its name or an empty string if the name is null.
      super.set(tag.name ?? "", tag);
    }

    // Return the current instance for method chaining.
    return this;
  }

  /**
   * Add a single tag to the compound tag.
   * @param tag The tag to add to the compound tag.
   * @returns The tag that was added.
   */
  public add<T extends BaseTag>(tag: T): T {
    // Add the tag to the compound tag using its name or an empty string if the name is null.
    this.set(tag.name ?? "", tag);

    // Return the tag that was added.
    return tag;
  }

  public static read(
    stream: BinaryStream,
    options: ReadWriteOptions = { name: true, type: true, varint: false }
  ): CompoundTag {
    // Check if the tag type is expected.
    if (options?.type) {
      // Read the tag type.
      const type: TagType = stream.readInt8();

      // Verify that the tag type matches the expected type.
      if (type !== TagType.Compound) {
        // Throw an error if the type does not match.
        throw new Error(
          `Expected tag type to be ${TagType[TagType.Compound]}, received ${TagType[type] ?? type}.`
        );
      }
    }

    // Prepare a variable to hold the name of the tag.
    let name: string | null = null;

    // Check if the tag name is expected.
    if (options?.name) {
      // Read the length of the name based on the varint option.
      const length = options?.varint
        ? stream.readVarInt()
        : stream.readInt16(Endianness.Little);

      // Read the name from the stream.
      const buffer = stream.read(length);

      // Convert the buffer to a string.
      name = buffer.toString("utf8");
    }

    // Create a new CompoundTag instance.
    const tag = new CompoundTag(name);

    // Read the tags until the end of the stream or a null tag is encountered.
    do {
      // Read the next tag type.
      const type: TagType = stream.readInt8();

      // Check if the tag type is End, which indicates the end of the compound tag.
      if (type === TagType.End) break;

      // Handle the tag type based on its value.
      switch (type) {
        default:
          throw new Error(`Unsupported tag type: ${TagType[type] ?? type}.`);

        case TagType.Byte: {
          // Read the next element as a ByteTag.
          const element = ByteTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Short: {
          // Read the next element as a ShortTag.
          const element = ShortTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Int: {
          // Read the next element as an IntTag.
          const element = IntTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Long: {
          // Read the next element as a LongTag.
          const element = LongTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Float: {
          // Read the next element as a FloatTag.
          const element = FloatTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Double: {
          // Read the next element as a DoubleTag.
          const element = DoubleTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.ByteList: {
          // Read the next element as a ByteListTag.
          const element = ByteListTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.String: {
          // Read the next element as a StringTag.
          const element = StringTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.List: {
          // Read the next element as a ListTag.
          const element = ListTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Compound: {
          // Read the next element as a CompoundTag.
          const element = CompoundTag.read(stream, {
            ...options,
            name: true,
            type: false
          });

          // Add the element to the CompoundTag instance.
          tag.set(element.name ?? "", element);

          // Continue to the next iteration.
          continue;
        }
      }
    } while (stream.feof() === false);

    // Return the CompoundTag instance.
    return tag;
  }

  public static write(
    stream: BinaryStream,
    value: CompoundTag,
    options: ReadWriteOptions = { name: true, type: true, varint: false }
  ): void {
    // Check if the tag type should be written.
    if (options?.type) stream.writeInt8(value.type);

    // Check if the tag name should be written.
    if (options?.name) {
      // Convert the name to a buffer.
      const buffer = Buffer.from(value.name ?? "", "utf8");

      // Write the length of the name based on the varint option.
      if (options.varint) stream.writeVarInt(buffer.length);
      else stream.writeInt16(buffer.length, Endianness.Little);

      // Write the name buffer to the stream.
      stream.write(buffer);
    }

    // Iterate over each tag in the CompoundTag instance.
    for (const [, tag] of value) {
      switch (tag.type) {
        case TagType.Byte: {
          // Write the ByteTag to the stream.
          ByteTag.write(stream, tag as ByteTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Short: {
          // Write the ShortTag to the stream.
          ShortTag.write(stream, tag as ShortTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Int: {
          // Write the IntTag to the stream.
          IntTag.write(stream, tag as IntTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Long: {
          // Write the LongTag to the stream.
          LongTag.write(stream, tag as LongTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Float: {
          // Write the FloatTag to the stream.
          FloatTag.write(stream, tag as FloatTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Double: {
          // Write the DoubleTag to the stream.
          DoubleTag.write(stream, tag as DoubleTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.ByteList: {
          // Write the ByteListTag to the stream.
          ByteListTag.write(stream, tag as ByteListTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.String: {
          // Write the StringTag to the stream.
          StringTag.write(stream, tag as StringTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.List: {
          // Write the ListTag to the stream.
          ListTag.write(stream, tag as ListTag<BaseTag>, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Compound: {
          // Write the CompoundTag to the stream.
          CompoundTag.write(stream, tag as CompoundTag, {
            ...options,
            name: true,
            type: true
          });

          // Continue to the next iteration.
          continue;
        }
      }
    }

    // Write the End tag to indicate the end of the compound tag.
    stream.writeInt8(TagType.End);
  }
}

export { CompoundTag };
