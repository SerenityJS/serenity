import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import { ByteTag } from "./byte";
import { IntTag } from "./int";
import { StringTag } from "./string";
import { ReadingProperties, Tag, TagProperties } from "./tag";
import { ShortTag } from "./short";
import { LongTag } from "./long";
import { DoubleTag } from "./double";
import { CompoundTag } from "./compound";
import { FloatTag } from "./float";

type GenericList<T extends Tag<unknown>> = Array<T>;

class ListTag<T extends Tag> extends Tag<GenericList<T>> {
  public static readonly type = TagType.List;

  public readonly listType: TagType;

  public value: GenericList<T> = [];

  public constructor(
    properties: Partial<TagProperties<GenericList<T>>> & { listType: TagType }
  ) {
    super(properties);

    this.value = properties.value ?? [];
    this.listType = properties.listType;
  }

  public push(...tag: Array<T>): void {
    this.value.push(...tag);
  }

  public static read<T extends Tag>(
    stream: BinaryStream,
    varint: boolean,
    properties: Partial<ReadingProperties> = { name: true, type: true }
  ): ListTag<T> {
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

    // Read the type of the tag.
    const type = stream.readByte() as TagType;

    // Read the length of the list.
    const length = varint
      ? stream.readZigZag()
      : stream.readInt32(Endianness.Little);

    // Create a new list tag.
    const tag = new this<T>({ name, value: [], listType: type });

    // Read the list tags.
    for (let i = 0; i < length; i++) {
      switch (type) {
        default: {
          throw new Error(
            `Unhandled tag type while reading List: ${TagType[type] ?? type}, offset: ${stream.offset}.`
          );
        }

        case TagType.Byte: {
          // Read the element tag, and add it to the list tag.
          const element = ByteTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.Short: {
          // Read the element tag, and add it to the list tag.
          const element = ShortTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.Int: {
          // Read the element tag, and add it to the list tag.
          const element = IntTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.Long: {
          // Read the element tag, and add it to the list tag.
          const element = LongTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.Float: {
          // Read the element tag, and add it to the list tag.
          const element = FloatTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.Double: {
          // Read the element tag, and add it to the list tag.
          const element = DoubleTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.ByteArray: {
          // Read the element tag, and add it to the list tag.
          const element = ByteTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.String: {
          // Read the element tag, and add it to the list tag.
          const element = StringTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.List: {
          // Read the element tag, and add it to the list tag.
          const element = ListTag.read(stream, varint, {
            name: false,
            type: false
          });

          tag.value.push(element as unknown as T);
          continue;
        }

        case TagType.Compound: {
          // Read the element tag, and add it to the list tag.
          const element = CompoundTag.read(stream, varint, { name: false });
          tag.value.push(element as unknown as T);
          continue;
        }
      }
    }

    // Return the list tag.
    return tag;
  }

  public static write<T extends Tag>(
    stream: BinaryStream,
    value: ListTag<T>,
    varint: boolean,
    properties: Partial<ReadingProperties> = { name: true, type: true }
  ): void {
    // Check if the type of the tag should be written.
    if (properties.type) stream.writeByte(this.type);

    // Check if the name of the tag should be written.
    if (properties.name) this.writeString(value.name, stream, varint);

    // Write the type of the list.
    stream.writeByte(value.listType);

    // Write the length of the list.
    if (varint) stream.writeZigZag(value.value.length);
    else stream.writeInt32(value.value.length, Endianness.Little);

    // Write the list tags.
    for (const element of value.value) {
      // Check if the element matches the list type.
      if (element.type !== value.listType) {
        throw new Error(
          `Expected tag type to be ${TagType[value.listType]}, received ${TagType[element.type]}.`
        );
      }

      switch (value.listType) {
        case TagType.Byte: {
          ByteTag.write(stream, element as ByteTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.Short: {
          ShortTag.write(stream, element as ShortTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.Int: {
          IntTag.write(stream, element as IntTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.Long: {
          LongTag.write(stream, element as LongTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.Float: {
          FloatTag.write(stream, element as FloatTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.Double: {
          DoubleTag.write(stream, element as DoubleTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.ByteArray: {
          ByteTag.write(stream, element as ByteTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.String: {
          StringTag.write(stream, element as StringTag, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.List: {
          ListTag.write(stream, element as unknown as ListTag<Tag>, varint, {
            name: false,
            type: false
          });
          continue;
        }

        case TagType.Compound: {
          CompoundTag.write(
            stream,
            element as unknown as CompoundTag<unknown>,
            varint,
            {
              name: false,
              type: false
            }
          );
          continue;
        }
      }
    }
  }
}

export { ListTag };
