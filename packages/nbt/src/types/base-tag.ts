import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import { ReadWriteOptions } from "./read-write-options";

abstract class BaseTag extends DataType {
  /**
   * The nbt tag type of the data type.
   */
  public abstract readonly type: TagType;

  /**
   * The name of the nbt tag.
   */
  public name: string | null = null;

  /**
   * Convert the tag to a JSON object.
   */
  public abstract toJSON<T = unknown>(): T;

  /**
   * Read the nbt tag from the stream.
   * @param stream The binary stream to read from.
   * @param options The options for reading the tag.
   */
  public static read(
    _stream: BinaryStream,
    _options?: ReadWriteOptions
  ): BaseTag {
    throw new Error("Method 'read' not implemented.");
  }

  /**
   * Write the nbt tag to the stream.
   * @param stream The binary stream to write to.
   * @param value The value of the tag to write.
   * @param options The options for writing the tag.
   */
  public static write(
    _stream: BinaryStream,
    _value: BaseTag,
    _options?: ReadWriteOptions
  ): void {
    throw new Error("Method 'write' not implemented.");
  }
}

export { BaseTag };
