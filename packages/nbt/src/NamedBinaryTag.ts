import { Buffer } from 'node:buffer';
import { Endianness, BinaryStream } from '@serenityjs/binarystream';
import { NbtTag } from './NbtTag';

export interface TagEntry<T extends NbtTag, V> {
	name: string;
	type: T;
	value: V;
}

export interface NbtTags<C = unknown> {
	[NbtTag.End]: TagEntry<NbtTag.End, null>;
	[NbtTag.Byte]: TagEntry<NbtTag.Byte, number>;
	[NbtTag.Short]: TagEntry<NbtTag.Short, number>;
	[NbtTag.Int]: TagEntry<NbtTag.Int, number>;
	[NbtTag.Long]: TagEntry<NbtTag.Long, bigint>;
	[NbtTag.Float]: TagEntry<NbtTag.Float, number>;
	[NbtTag.Double]: TagEntry<NbtTag.Double, number>;
	[NbtTag.ByteList]: TagEntry<NbtTag.ByteList, number[]>;
	[NbtTag.String]: TagEntry<NbtTag.String, string>;
	[NbtTag.List]: TagEntry<NbtTag.List, TagEntry<NbtTag, C>[]>;
	[NbtTag.Compound]: TagEntry<NbtTag.Compound, TagEntry<NbtTag, C>[]>;
	[NbtTag.IntList]: TagEntry<NbtTag.IntList, number[]>;
	[NbtTag.LongList]: TagEntry<NbtTag.LongList, bigint[]>;
}

class NamedBinaryTag extends BinaryStream {
	protected readonly varint: boolean;
	protected readonly readLength: (endian?: Endianness | null | undefined) => number;
	protected readonly writeLength: (value: number, endian?: Endianness | null | undefined) => void;

	public constructor(buffer?: Buffer, varint = false) {
		super(buffer);
		this.varint = varint;
		this.readLength = varint ? this.readVarInt : this.readUint16;
		this.writeLength = varint ? this.writeVarInt : this.writeUint16;
	}

	protected readString(): string {
		const length = this.readLength(Endianness.Little);
		const value = this.read(length);

		return String.fromCodePoint(...value);
	}

	protected writeString(value: string): void {
		this.writeLength(value.length, Endianness.Little);
		this.writeBuffer(Buffer.from(value));
	}

	public readTag<T extends keyof NbtTags, C = unknown>(): NbtTags<C>[T] {
		const tag = this.readByte() as NbtTag;

		switch (tag) {
			default: {
				throw new Error(`Unknown tag type: ${tag} at offset ${this.offset - 1}`);
			}

			case NbtTag.End: {
				return { name: '', type: NbtTag.End, value: null } as NbtTags<C>[T];
			}

			case NbtTag.Byte: {
				return this.readByteTag() as NbtTags<C>[T];
			}

			case NbtTag.Short: {
				return this.readShortTag() as NbtTags<C>[T];
			}

			case NbtTag.Int: {
				return this.readIntTag() as NbtTags<C>[T];
			}

			case NbtTag.Long: {
				return this.readLongTag() as NbtTags<C>[T];
			}

			case NbtTag.Float: {
				return this.readFloatTag() as NbtTags<C>[T];
			}

			case NbtTag.Double: {
				return this.readDoubleTag() as NbtTags<C>[T];
			}

			case NbtTag.ByteList: {
				return this.readByteListTag() as NbtTags<C>[T];
			}

			case NbtTag.String: {
				return this.readStringTag() as NbtTags<C>[T];
			}

			case NbtTag.List: {
				return this.readListTag() as NbtTags<C>[T];
			}

			case NbtTag.Compound: {
				return this.readCompoundTag() as NbtTags<C>[T];
			}
		}
	}

	public readByteTag(): TagEntry<NbtTag.Byte, number> {
		return {
			name: this.readString(),
			type: NbtTag.Byte,
			value: this.readByte(),
		};
	}

	public writeByteTag(value: TagEntry<NbtTag.Byte, number>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeByte(value.value);
	}

	public readShortTag(): TagEntry<NbtTag.Short, number> {
		return {
			name: this.readString(),
			type: NbtTag.Short,
			value: this.readShort(Endianness.Little),
		};
	}

	public writeShortTag(value: TagEntry<NbtTag.Short, number>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeShort(value.value, Endianness.Little);
	}

	public readIntTag(): TagEntry<NbtTag.Int, number> {
		return {
			name: this.readString(),
			type: NbtTag.Int,
			value: this.varint ? this.readVarInt() : this.readInt32(Endianness.Little),
		};
	}

	public writeIntTag(value: TagEntry<NbtTag.Int, number>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		if (this.varint) {
			this.writeVarInt(value.value);
		} else {
			this.writeInt32(value.value, Endianness.Little);
		}
	}

	public readLongTag(): TagEntry<NbtTag.Long, bigint> {
		return {
			name: this.readString(),
			type: NbtTag.Long,
			value: this.readLong(Endianness.Little),
		};
	}

	public writeLongTag(value: TagEntry<NbtTag.Long, bigint>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeLong(value.value, Endianness.Little);
	}

	public readFloatTag(): TagEntry<NbtTag.Float, number> {
		return {
			name: this.readString(),
			type: NbtTag.Float,
			value: this.readFloat32(Endianness.Little),
		};
	}

	public writeFloatTag(value: TagEntry<NbtTag.Float, number>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeFloat32(value.value, Endianness.Little);
	}

	public readDoubleTag(): TagEntry<NbtTag.Double, number> {
		return {
			name: this.readString(),
			type: NbtTag.Double,
			value: this.readFloat64(Endianness.Little),
		};
	}

	public writeDoubleTag(value: TagEntry<NbtTag.Double, number>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeFloat64(value.value, Endianness.Little);
	}

	public readByteListTag(): TagEntry<NbtTag.ByteList, number[]> {
		const name = this.readString();
		const length = this.readInt32(Endianness.Little);
		const value = this.read(length);

		return {
			name,
			type: NbtTag.ByteList,
			value,
		};
	}

	public writeByteListTag(value: TagEntry<NbtTag.ByteList, number[]>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeInt32(value.value.length, Endianness.Little);
		this.write(value.value);
	}

	public readStringTag(): TagEntry<NbtTag.String, string> {
		return {
			name: this.readString(),
			type: NbtTag.String,
			value: this.readString(),
		};
	}

	public writeStringTag(value: TagEntry<NbtTag.String, string>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeString(value.value);
	}

	public readListTag<C = unknown>(): TagEntry<NbtTag.List, C[]> {
		const name = this.readString();
		const type = this.readByte() as C;
		const length = this.varint ? this.readVarInt() : this.readInt32(Endianness.Little);
		const entries: C[] = [];

		for (let i = 0; i < length; i++) {
			switch (type) {
				default: {
					throw new Error(`Unknown tag type: ${type}`);
				}

				case NbtTag.Byte: {
					entries.push(this.readByte() as C);
					break;
				}

				case NbtTag.Short: {
					entries.push(this.readShort(Endianness.Little) as C);
					break;
				}

				case NbtTag.Int: {
					entries.push(this.readInt32(Endianness.Little) as C);
					break;
				}

				case NbtTag.Long: {
					entries.push(this.readLong(Endianness.Little) as C);
					break;
				}

				case NbtTag.Float: {
					entries.push(this.readFloat32(Endianness.Little) as C);
					break;
				}

				case NbtTag.Double: {
					entries.push(this.readFloat64(Endianness.Little) as C);
					break;
				}

				case NbtTag.ByteList: {
					const size = this.readInt32(Endianness.Little);
					const bytes: number[] = [];

					for (let i = 0; i < size; i++) {
						bytes.push(this.readByte());
					}

					entries.push(bytes as C);
					break;
				}

				case NbtTag.String: {
					entries.push(this.readString16(Endianness.Little) as C);
					break;
				}

				case NbtTag.List: {
					throw new Error('Nested lists are not supported yet');
				}

				case NbtTag.Compound: {
					const entries2: TagEntry<NbtTag, C>[] = [];

					do {
						const tag = this.readTag();

						if (tag.type === NbtTag.End) break;

						entries.push(tag as C);
					} while (this.cursorAtEnd() === false);

					entries.push(entries2 as C);
					break;
				}
			}
		}

		return {
			name,
			type: NbtTag.List,
			value: entries,
		};
	}

	public writeListTag<C = unknown>(value: TagEntry<NbtTag.List, C[]>): void {
		this.writeByte(value.type);
		this.writeString(value.name);
		this.writeByte(value.value[0] as number);
		this.writeInt32(value.value.length, Endianness.Little);

		for (const entry of value.value) {
			switch (value.value[0]) {
				default: {
					throw new Error(`Unknown tag type: ${value.value[0]}`);
				}

				case NbtTag.Byte: {
					this.writeByte(entry as number);
					break;
				}

				case NbtTag.Short: {
					this.writeShort(entry as number, Endianness.Little);
					break;
				}

				case NbtTag.Int: {
					this.writeInt32(entry as number, Endianness.Little);
					break;
				}

				case NbtTag.Long: {
					this.writeLong(entry as bigint, Endianness.Little);
					break;
				}

				case NbtTag.Float: {
					this.writeFloat32(entry as number, Endianness.Little);
					break;
				}

				case NbtTag.Double: {
					this.writeFloat64(entry as number, Endianness.Little);
					break;
				}

				case NbtTag.ByteList: {
					this.writeInt32((entry as number[]).length, Endianness.Little);
					this.write(entry as number[]);
					break;
				}

				case NbtTag.String: {
					this.writeString16(entry as string, Endianness.Little);
					break;
				}

				case NbtTag.List: {
					throw new Error('Nested lists are not supported yet');
				}

				case NbtTag.Compound: {
					throw new Error('Writing nested compounds are not supported yet');
				}
			}
		}
	}

	public readCompoundTag<C = unknown>(): TagEntry<NbtTag.Compound, TagEntry<NbtTag, unknown>[]> {
		const name = this.readString();
		const entries: TagEntry<NbtTag, C>[] = [];

		do {
			const tag = this.readTag();

			if (tag.type === NbtTag.End) break;

			entries.push(tag as TagEntry<NbtTag, C>);
		} while (this.cursorAtEnd() === false);

		return {
			name,
			type: NbtTag.Compound,
			value: entries,
		};
	}
}

export { NamedBinaryTag };
