import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { TagType } from "../enum";

interface TagProperties<T = unknown> {
  name: string;
  value: T;
}

interface ReadingProperties {
  name: boolean;
  type: boolean;
}

interface WritingProperties {
  name: boolean;
  type: boolean;
}

class Tag<T = unknown> {
  /**
   * The nbt tag type of the data type.
   */
  public static readonly type: TagType;

  /**
   * The nbt tag type of the data type.
   */
  public readonly type: TagType = (this.constructor as typeof Tag).type;

  /**
   * The name of the tag.
   */
  public name: string = "";

  /**
   * The value of the tag.
   */
  public value: T = null as T;

  public constructor(properties: Partial<TagProperties<T>> = {}) {
    // Assign the properties to the tag.
    this.name = properties.name ?? this.name;
    this.value = properties.value ?? this.value;
  }

  public toJSON(): TagProperties<T> & { type: TagType } {
    return { name: this.name, value: this.value, type: this.type };
  }

  public static from(buffer: Buffer, varint = false): Tag {
    // Create a new binary stream.
    const stream = new BinaryStream(buffer);

    // Read the tag from the binary stream.
    return this.read(stream, varint);
  }

  /**
   * Read a nbt tag from a binary stream.
   * @param stream The binary stream to read from.
   * @param varint Whether to read the tag as a varint.
   */
  public static read(
    _stream: BinaryStream,
    _varint: number | boolean = false,
    _properties: Partial<ReadingProperties> = { name: true, type: true }
  ): Tag {
    throw new Error("Method not implemented.");
  }

  /**
   * Write a nbt tag to a binary stream.
   * @param stream The binary stream to write to.
   * @param value The value of the tag.
   * @param varint Whether to write the tag as a varint.
   */
  public static write(
    _stream: BinaryStream,
    _value: Tag,
    _varint: number | boolean = false,
    _properties: Partial<WritingProperties> = { name: true, type: true }
  ): void {
    throw new Error("Method not implemented.");
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
    if (varint) {
      stream.writeVarInt(buffer.length);
    } else {
      stream.writeShort(buffer.length, Endianness.Little);
    }

    // Write the buffer.
    stream.writeBuffer(buffer);
  }
}

export { Tag, TagProperties, ReadingProperties, WritingProperties };
