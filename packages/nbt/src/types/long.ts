import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import {
  ReadingProperties,
  Tag,
  TagProperties,
  WritingProperties
} from "./tag";

class LongTag extends Tag<bigint> {
  public static readonly type = TagType.Long;

  public toJSON(): TagProperties<bigint> & { type: TagType } {
    const value = (this.value.toString() + "n") as unknown as bigint;

    return { name: this.name, value, type: this.type };
  }

  public static read(
    stream: BinaryStream,
    varint: boolean,
    properties: Partial<ReadingProperties> = { name: true, type: true }
  ): Tag {
    // Check if type checking is enabled.
    if (properties.type) {
      // Read the type of the tag.
      const type = stream.readByte() as TagType;

      // Check if the type is correct.
      if (type !== this.type) {
        throw new Error(
          `Expected tag type to be ${TagType[this.type]}, received ${TagType[type] ?? type}.`
        );
      }
    }

    // Read the name of the tag.
    const name = properties.name
      ? this.readString(stream, varint)
      : (null as unknown as string);

    // Read the value of the tag.
    const value = varint
      ? stream.readVarLong()
      : stream.readLong(Endianness.Little);

    // Read the value of the tag.
    return new this({ name, value });
  }

  public static write(
    stream: BinaryStream,
    value: LongTag,
    varint: boolean,
    properties: Partial<WritingProperties> = { name: true, type: true }
  ): void {
    // Check if the type of the tag should be written.
    if (properties.type) stream.writeByte(this.type);

    // Check if the name of the tag should be written.
    if (properties.name) this.writeString(value.name, stream, varint);

    // Write the value of the tag.
    if (varint) stream.writeVarLong(value.value);
    else stream.writeLong(value.value, Endianness.Little);
  }
}

export { LongTag };
