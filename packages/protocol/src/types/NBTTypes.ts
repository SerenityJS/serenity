import type { Endianness, BinaryStream } from '@serenityjs/binaryutils';
import type { NBTCompoud, NBTValue } from '@serenityjs/nbt';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BedrockNBT } from '@serenityjs/nbt';
import { DataType } from '@serenityjs/raknet-protocol';

export class NBTTagItemData extends DataType {
	public static write(
		stream: BinaryStream,
		value: NBTValue,
		endian?: Endianness | null | undefined,
		param?: any,
	): void {
		BedrockNBT.WriteRootTag(stream, value);
	}
	public static read(stream: BinaryStream, endian?: Endianness | null | undefined, param?: any): NBTCompoud {
		return BedrockNBT.ReadRootTag(stream) as NBTCompoud;
	}
}
