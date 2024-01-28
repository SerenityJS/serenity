import { Buffer } from 'node:buffer';
import { Endianness } from '@serenityjs/binarystream';
import type { BinaryStream } from '@serenityjs/binarystream';
import type { NBTValue } from '../NBT';
import { NBTTag, Int16, Int32, Int64, Float, Double } from '../NBT';
import { GeneralNBTDefinitionWriter, GeneralNBTDefinitionReader, NBT } from './General';

class LightNBTDefinitionWriter extends GeneralNBTDefinitionWriter {
	public [NBTTag.Int16](value: number): void {
		this.stream.writeInt16(value, Endianness.Little);
	}
	public [NBTTag.Int32](value: number): void {
		this.stream.writeVarInt(value);
	}
	public [NBTTag.Float](value: number): void {
		this.stream.writeFloat32(value, Endianness.Little);
	}
	public [NBTTag.Double](value: number): void {
		this.stream.writeFloat64(value, Endianness.Little);
	}
	public [NBTTag.Int64](value: bigint): void {
		this.stream.writeVarLong(value);
	}
	public [NBTTag.ByteArray](value: Buffer): void {
		this.stream.writeVarInt(value.length);
		this.stream.writeBuffer(value);
	}
	public [NBTTag.String](value: string): void {
		const buf = Buffer.from(value, 'utf8');
		this.stream.writeVarInt(buf.length);
		this.stream.writeBuffer(buf);
	}
	public writeCompoudKey(key: string): void {
		const buf = Buffer.from(key, 'utf8');
		this.stream.writeVarInt(buf.length);
		this.stream.writeBuffer(buf);
	}
	public writeArraySize(size: number): void {
		this.stream.writeVarInt(size * 2);
	} // IDK why the size is doubled
}
class LightNBTDefinitionReader extends GeneralNBTDefinitionReader {
	public readCompoudKey(): string {
		return this.stream.readBuffer(this.stream.readVarInt()).toString('utf8');
	}
	public readArraySize(): number {
		return this.stream.readVarInt() / 2;
	} // IDK why the size is doubled
	public [NBTTag.Int16](): Int16 {
		return Int16(this.stream.readInt16(Endianness.Little));
	}
	public [NBTTag.Int32](): Int32 {
		return Int32(this.stream.readVarInt());
	}
	public [NBTTag.Float](): Float {
		return Float(this.stream.readFloat32(Endianness.Little));
	}
	public [NBTTag.Double](): Double {
		return Double(this.stream.readFloat64(Endianness.Little));
	}
	public [NBTTag.Int64](): Int64 {
		return Int64(this.stream.readVarLong());
	}
	public [NBTTag.ByteArray](): Buffer {
		return this.stream.readBuffer(this.stream.readVarInt());
	}
	public [NBTTag.String](): string {
		return this.stream.readBuffer(this.stream.readVarInt()).toString('utf8');
	}
}

class LightNBT extends NBT {
	public static ReadRootTag(stream: BinaryStream): NBTValue {
		return new LightNBTDefinitionReader(stream).ReadRootTag();
	}
	public static ReadTag(stream: BinaryStream): NBTValue {
		return new LightNBTDefinitionReader(stream).ReadTag();
	}
	public static Read(tag: number, stream: BinaryStream): NBTValue {
		return new LightNBTDefinitionReader(stream).Read(tag);
	}
	public static WriteRootTag(stream: BinaryStream, tag: NBTValue) {
		new LightNBTDefinitionWriter(stream).WriteRootTag(tag);
	}
	public static WriteTag(stream: BinaryStream, tag: NBTValue) {
		new LightNBTDefinitionWriter(stream).WriteTag(tag);
	}
	public static Write(stream: BinaryStream, tag: NBTValue) {
		new LightNBTDefinitionWriter(stream).Write(tag);
	}
}
export { LightNBT, LightNBTDefinitionReader, LightNBTDefinitionWriter };
