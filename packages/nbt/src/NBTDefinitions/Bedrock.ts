import { Endianness } from '@serenityjs/binarystream';
import type { BinaryStream } from '@serenityjs/binarystream';
import type { NBTValue } from '../NBT';
import { NBTTag, Int16, Int32, Int64, Float, Double } from '../NBT';
import { GeneralNBTDefinitionWriter, GeneralNBTDefinitionReader, NBT } from './General';

class BedrockNBTDefinitionWriter extends GeneralNBTDefinitionWriter {
	public [NBTTag.Int16](value: number): void {
		this.stream.writeInt16(value, Endianness.Little);
	}
	public [NBTTag.Int32](value: number): void {
		this.stream.writeInt32(value, Endianness.Little);
	}
	public [NBTTag.Float](value: number): void {
		this.stream.writeFloat32(value, Endianness.Little);
	}
	public [NBTTag.Double](value: number): void {
		this.stream.writeFloat64(value, Endianness.Little);
	}
	public [NBTTag.Int64](value: bigint): void {
		this.stream.writeInt64(value, Endianness.Little);
	}
	public [NBTTag.String](value: string): void {
		this.stream.writeString16(value, Endianness.Little);
	}
	public writeCompoudKey(key: string): void {
		this[NBTTag.String](key);
	}
	public writeArraySize(size: number): void {
		this[NBTTag.Int32](size);
	}
}
class BedrockNBTDefinitionReader extends GeneralNBTDefinitionReader {
	public readCompoudKey(): string {
		return this[NBTTag.String]();
	}
	public readArraySize(): number {
		return this[NBTTag.Int32]().valueOf();
	}
	public [NBTTag.Int16](): Int16 {
		return Int16(this.stream.readInt16(Endianness.Little));
	}
	public [NBTTag.Int32](): Int32 {
		return Int32(this.stream.readInt32(Endianness.Little));
	}
	public [NBTTag.Float](): Float {
		return Float(this.stream.readFloat32(Endianness.Little));
	}
	public [NBTTag.Double](): Double {
		return Double(this.stream.readFloat64(Endianness.Little));
	}
	public [NBTTag.Int64](): Int64 {
		return Int64(this.stream.readInt64(Endianness.Little));
	}
	public [NBTTag.String](): string {
		return this.stream.readString16(Endianness.Little);
	}
}
class BedrockNBT extends NBT {
	public static ReadRootTag(stream: BinaryStream): NBTValue {
		return new BedrockNBTDefinitionReader(stream).ReadRootTag();
	}
	public static ReadTag(stream: BinaryStream): NBTValue {
		return new BedrockNBTDefinitionReader(stream).ReadTag();
	}
	public static Read(tag: number, stream: BinaryStream): NBTValue {
		return new BedrockNBTDefinitionReader(stream).Read(tag);
	}
	public static WriteRootTag(stream: BinaryStream, tag: NBTValue) {
		new BedrockNBTDefinitionWriter(stream).WriteRootTag(tag);
	}
	public static WriteTag(stream: BinaryStream, tag: NBTValue) {
		new BedrockNBTDefinitionWriter(stream).WriteTag(tag);
	}
	public static Write(stream: BinaryStream, tag: NBTValue) {
		new BedrockNBTDefinitionWriter(stream).Write(tag);
	}
}
export { BedrockNBT, BedrockNBTDefinitionReader, BedrockNBTDefinitionWriter };
