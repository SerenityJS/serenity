/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { BinaryStream } from "@serenityjs/binarystream";

import { TagType } from "../enum";

import {
  ReadingProperties,
  Tag,
  TagProperties,
  WritingProperties
} from "./tag";
import { ByteTag } from "./byte";
import { StringTag } from "./string";
import { ShortTag } from "./short";
import { IntTag } from "./int";
import { LongTag } from "./long";
import { DoubleTag } from "./double";
import { ListTag } from "./list";
import { FloatTag } from "./float";
import { ByteArrayTag } from "./byte-array";

type GenericCompound<T = Record<string, Tag>> = T;

class CompoundTag<T> extends Tag<GenericCompound<T>> {
  public static readonly type = TagType.Compound;

  public value: T = {} as T;

  public constructor(properties?: Partial<TagProperties<T>>) {
    super(properties);

    this.value = properties?.value ?? ({} as T);
  }

  public hasTag(name: string): boolean {
    return name in (this.value as Record<string, Tag>);
  }

  public getTag<K extends Tag>(name: string): K {
    return this.value[name as keyof T] as K;
  }

  public getTags(): Array<Tag> {
    return Object.values(this.value as Record<string, Tag>);
  }

  public setTag(name: string, tag: Tag): void {
    this.value[name as keyof T] = tag as unknown as T[keyof T];
  }

  public addTag(tag: Tag): void {
    this.value[tag.name as keyof T] = tag as unknown as T[keyof T];
  }

  public removeTag(name: string): void {
    delete this.value[name as keyof T];
  }

  public createByteTag(properties: Partial<TagProperties<number>>): ByteTag {
    // Create a new byte tag.
    const tag = new ByteTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createShortTag(properties: Partial<TagProperties<number>>): ShortTag {
    // Create a new short tag.
    const tag = new ShortTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createIntTag(properties: Partial<TagProperties<number>>): IntTag {
    // Create a new int tag.
    const tag = new IntTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createLongTag(properties: Partial<TagProperties<bigint>>): LongTag {
    // Create a new long tag.
    const tag = new LongTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createFloatTag(properties: Partial<TagProperties<number>>): FloatTag {
    // Create a new float tag.
    const tag = new FloatTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createDoubleTag(
    properties: Partial<TagProperties<number>>
  ): DoubleTag {
    // Create a new double tag.
    const tag = new DoubleTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createStringTag(
    properties: Partial<TagProperties<string>>
  ): StringTag {
    // Create a new string tag.
    const tag = new StringTag(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createListTag<T extends Tag>(
    properties: Partial<TagProperties<Array<T>>> & { listType: TagType }
  ): ListTag<T> {
    // Create a new list tag.
    const tag = new ListTag<T>(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public createCompoundTag<T>(
    properties: Partial<TagProperties<GenericCompound<T>>>
  ): CompoundTag<T> {
    // Create a new compound tag.
    const tag = new CompoundTag<T>(properties);

    // Add the tag to the compound tag.
    this.addTag(tag);

    // Return the tag.
    return tag;
  }

  public toJSON(): TagProperties<T> & { type: TagType } {
    const json: Record<string, T> = {};

    for (const [key, value] of Object.entries(
      this.value as Record<string, Tag>
    )) {
      // @ts-ignore
      json[key] = value.toJSON();
    }

    return { name: this.name, value: json as T, type: this.type };
  }

  public static read<T>(
    stream: BinaryStream,
    varint: boolean = false,
    properties: Partial<ReadingProperties> = { name: true, type: true }
  ): CompoundTag<T> {
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

    // Create a new compound tag.
    const tag = new this<T>({ name, value: {} as T });

    // Read the tags within the compound tag.
    do {
      // Read the next tag type.
      const type = stream.readByte() as TagType;

      // Break if the tag type is the end tag.
      if (type === TagType.End) break;

      switch (type) {
        default: {
          throw new Error(
            `Unhandled tag type while reading Compound: ${TagType[type] ?? type}, offset: ${stream.offset}.`
          );
        }

        case TagType.Byte: {
          // Read the element tag, and add it to the compound tag.
          const element = ByteTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.Short: {
          // Read the element tag, and add it to the compound tag.
          const element = ShortTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.Int: {
          // Read the element tag, and add it to the compound tag.
          const element = IntTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.Long: {
          // Read the element tag, and add it to the compound tag.
          const element = LongTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.Float: {
          // Read the element tag, and add it to the compound tag.
          const element = FloatTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.Double: {
          // Read the element tag, and add it to the compound tag.
          const element = DoubleTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.ByteArray: {
          // Read the element tag, and add it to the compound tag.
          const element = ByteArrayTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.String: {
          // Read the element tag, and add it to the compound tag.
          const element = StringTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.List: {
          // Read the element tag, and add it to the compound tag.
          const element = ListTag.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }

        case TagType.Compound: {
          // Read the element tag, and add it to the compound tag.
          const element = this.read(stream, varint, {
            name: true,
            type: false
          });

          tag.value[element.name as keyof T] = element as unknown as T[keyof T];
          continue;
        }
      }
    } while (stream.cursorAtEnd() === false);

    // Return the compound tag.
    return tag;
  }

  public static write<T>(
    stream: BinaryStream,
    value: CompoundTag<T>,
    varint: boolean = false,
    properties: Partial<WritingProperties> = { name: true, type: true }
  ): void {
    // Check if the type of the tag should be written.
    if (properties.type) stream.writeByte(this.type);

    // Check if the name of the tag should be written.
    if (properties.name) this.writeString(value.name, stream, varint);

    // Get the keys of the compound tag.
    const keys = Object.keys(value.value as Record<string, Tag>);

    // Write the tags within the compound tag.
    for (const key of keys) {
      // Get the tag from the compound tag.
      const tag = value.value[key as keyof T] as Tag;

      // Write the tag to the binary stream.
      stream.writeByte(tag.type);

      switch (tag.type) {
        default: {
          throw new Error(
            `Unhandled tag type while writing Compound: ${TagType[tag.type] ?? tag.type}.`
          );
        }

        case TagType.Byte: {
          // Write the element tag to the binary stream.
          ByteTag.write(stream, tag as ByteTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.Short: {
          // Write the element tag to the binary stream.
          ShortTag.write(stream, tag as ShortTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.Int: {
          // Write the element tag to the binary stream.
          IntTag.write(stream, tag as IntTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.Long: {
          // Write the element tag to the binary stream.
          LongTag.write(stream, tag as LongTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.Float: {
          // Write the element tag to the binary stream.
          FloatTag.write(stream, tag as FloatTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.Double: {
          // Write the element tag to the binary stream.
          DoubleTag.write(stream, tag as DoubleTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.ByteArray: {
          // Write the element tag to the binary stream.
          ByteArrayTag.write(stream, tag as ByteArrayTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.String: {
          // Write the element tag to the binary stream.
          StringTag.write(stream, tag as StringTag, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.List: {
          // Write the element tag to the binary stream.
          ListTag.write(stream, tag as ListTag<Tag>, varint, {
            name: true,
            type: false
          });

          continue;
        }

        case TagType.Compound: {
          // Write the element tag to the binary stream.
          this.write(stream, tag as CompoundTag<unknown>, varint, {
            name: true,
            type: false
          });

          continue;
        }
      }
    }

    // Write the end tag to the binary stream.
    stream.writeByte(TagType.End);
  }

  public static from<T>(
    buffer: Buffer,
    varint: boolean = false
  ): CompoundTag<T> {
    // Create a new binary stream.
    const stream = new BinaryStream(buffer);

    // Read the tag from the binary stream.
    return this.read(stream, varint);
  }
}

export { CompoundTag };
