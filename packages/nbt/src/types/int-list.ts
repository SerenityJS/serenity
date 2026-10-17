import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import { BaseTag } from "./base-tag";
import { ReadWriteOptions } from "./read-write-options";

class IntListTag extends Array<number> implements BaseTag {
  public readonly type = TagType.IntList;

  public name: string | null;

  /**
   * Create a new IntListTag instance.
   * @param elements The elements of the int list.
   * @param name The name of the tag, defaults to null.
   */
  public constructor(elements: Array<number>, name?: string | null) {
    // Push the elements, so a single element is not treated as a length.
    super();
    this.push(...elements);
    this.name = name ?? null;
  }

  public map<U>(
    callbackfn: (value: number, index: number, array: Array<number>) => U,
    thisArg?: unknown
  ): Array<U> {
    // Convert the int list to a regular array.
    const array = Array.from(this);

    // Map the elements of the list using the provided callback function.
    return array.map(callbackfn, thisArg);
  }

  public toJSON<T = Array<number>>(): T {
    // Convert the int list to a JSON array.
    return this.map((value) => value?.valueOf() ?? 0) as T;
  }

  public static read(
    stream: BinaryStream,
    options: ReadWriteOptions = { name: true, type: true, varint: false }
  ): IntListTag {
    // Check if the tag type is expected.
    if (options?.type) {
      // Read the tag type.
      const type: TagType = stream.readInt8();

      // Verify that the tag type matches the expected type.
      if (type !== TagType.IntList) {
        // Throw an error if the type does not match.
        throw new Error(
          `Expected tag type to be ${TagType[TagType.IntList]}, received ${TagType[type] ?? type}.`
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

    // Read the length of the int list based on the varint option.
    const length = options?.varint
      ? stream.readZigZag()
      : stream.readInt32(Endianness.Little);

    // Read the int values from the stream.
    const value: Array<number> = [];
    for (let i = 0; i < length; i++) {
      value.push(
        options?.varint
          ? stream.readZigZag()
          : stream.readInt32(Endianness.Little)
      );
    }

    // Create and return a new IntListTag instance.
    return new this(value, name);
  }

  public static write(
    stream: BinaryStream,
    value: IntListTag,
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

    // Write the length of the int list based on the varint option.
    if (options?.varint) stream.writeZigZag(value.length);
    else stream.writeInt32(value.length, Endianness.Little);

    // Write the int values to the stream.
    for (const element of value) {
      if (options?.varint) stream.writeZigZag(element?.valueOf() ?? 0);
      else stream.writeInt32(element?.valueOf() ?? 0, Endianness.Little);
    }
  }
}

export { IntListTag };
