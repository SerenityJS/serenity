import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import { BaseTag } from "./base-tag";
import { ReadWriteOptions } from "./read-write-options";
import { ByteTag } from "./byte";
import { ShortTag } from "./short";
import { IntTag } from "./int";
import { LongTag } from "./long";
import { FloatTag } from "./float";
import { DoubleTag } from "./double";
import { StringTag } from "./string";
import { CompoundTag } from "./compound";
import { ByteListTag } from "./byte-list";

class ListTag<T extends BaseTag> extends Array<T> implements BaseTag {
  public readonly type = TagType.List;
  public name: string | null;

  // Accept array | iterable | single T | numeric length
  public constructor(
    elements?: Array<T> | Iterable<T> | T | number,
    name?: string | null
  ) {
    if (typeof elements === "number") {
      // numeric length ctor behavior
      super(elements);
    } else {
      super(); // start empty; push safely
      if (elements !== undefined && elements !== null) {
        const maybeIterable = elements as unknown as Iterable<T>;
        if (
          typeof maybeIterable[Symbol.iterator] === "function" &&
          typeof elements !== "string"
        ) {
          for (const el of maybeIterable as Iterable<T>) this.push(el);
        } else {
          // treat as a single element
          this.push(elements as T);
        }
      }
    }
    this.name = name ?? null;
  }

  // Keep array methods returning plain arrays (optional but often desired)
  public static get [Symbol.species]() {
    return Array;
  }

  public map<U>(
    callbackfn: (value: T, index: number, array: Array<T>) => U,
    thisArg?: unknown
  ): Array<U> {
    return Array.from(this).map(callbackfn, thisArg);
  }

  public slice(start?: number, end?: number): Array<T> {
    return Array.from(this).slice(start, end);
  }

  public toJSON<T = Array<unknown>>(): T {
    return this.map((element) => element.toJSON()) as T;
  }

  public static read<T extends BaseTag>(
    stream: BinaryStream,
    options: ReadWriteOptions = { name: true, type: true, varint: false }
  ): ListTag<T> {
    // Check if the tag type is expected.
    if (options?.type) {
      // Read the tag type.
      const type: TagType = stream.readInt8();

      // Verify that the tag type matches the expected type.
      if (type !== TagType.List) {
        // Throw an error if the type does not match.
        throw new Error(
          `Expected tag type to be ${TagType[TagType.List]}, received ${TagType[type] ?? type}.`
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

    // Read the type of elements in the list.
    const type: TagType = stream.readInt8();

    // Read the length of the list.
    const length = options?.varint
      ? stream.readZigZag()
      : stream.readInt32(Endianness.Little);

    // Create a new ListTag instance.
    const tag = new this<T>([], name);

    // Read the list elements based on the type.
    for (let i = 0; i < length; i++) {
      switch (type) {
        default:
          throw new Error(`Unsupported list type: ${TagType[type] ?? type}`);

        case TagType.Byte: {
          // Read the next element as a ByteTag.
          const element = ByteTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Short: {
          // Read the next element as a ShortTag.
          const element = ShortTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Int: {
          // Read the next element as an IntTag.
          const element = IntTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Long: {
          // Read the next element as a LongTag.
          const element = LongTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Float: {
          // Read the next element as a FloatTag.
          const element = FloatTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Double: {
          // Read the next element as a DoubleTag.
          const element = DoubleTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.ByteList: {
          // Read the next element as a ByteListTag.
          const element = ByteListTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.String: {
          // Read the next element as a StringTag.
          const element = StringTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.List: {
          // Read the next element as a ListTag.
          const element = ListTag.read<T>(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }

        case TagType.Compound: {
          // Read the next element as a CompoundTag.
          const element = CompoundTag.read(stream, {
            ...options,
            name: false,
            type: false
          });

          // Add the element to the list.
          tag.push(element as unknown as T);

          // Continue to the next iteration.
          continue;
        }
      }
    }

    // Return the tag with the type and name set.
    return tag;
  }

  public static write<T extends BaseTag>(
    stream: BinaryStream,
    value: ListTag<T>,
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

    // Check if an element is present in the list.
    if (!value[0]) {
      // If not, write an empty list type and length.
      stream.writeInt8(TagType.Byte);
    } else {
      // If so, get the type of the first element.
      const type = value[0].type;

      // Write the type of the list.
      stream.writeInt8(type);
    }

    // Write the length of the list.
    if (options?.varint) stream.writeZigZag(value.length);
    else stream.writeInt32(value.length, Endianness.Little);

    // Iterate over each element in the list.
    for (const element of value) {
      // Handle each type of element based on its tag type.
      switch (element.type) {
        case TagType.Byte: {
          // Write the element as a ByteTag.
          ByteTag.write(stream, element as unknown as ByteTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Short: {
          // Write the element as a ShortTag.
          ShortTag.write(stream, element as unknown as ShortTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Int: {
          // Write the element as an IntTag.
          IntTag.write(stream, element as unknown as IntTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Long: {
          // Write the element as a LongTag.
          LongTag.write(stream, element as unknown as LongTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Float: {
          // Write the element as a FloatTag.
          FloatTag.write(stream, element as unknown as FloatTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Double: {
          // Write the element as a DoubleTag.
          DoubleTag.write(stream, element as unknown as DoubleTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.ByteList: {
          // Write the element as a ByteTag.
          ByteListTag.write(stream, element as unknown as ByteListTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.String: {
          // Write the element as a StringTag.
          StringTag.write(stream, element as unknown as StringTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.List: {
          // Write the element as a ListTag.
          ListTag.write(stream, element as unknown as ListTag<T>, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }

        case TagType.Compound: {
          // Write the element as a CompoundTag.
          CompoundTag.write(stream, element as unknown as CompoundTag, {
            ...options,
            name: false,
            type: false
          });

          // Continue to the next iteration.
          continue;
        }
      }
    }
  }
}

export { ListTag };
