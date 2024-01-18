import { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { NBTTagData, type NBTData } from './NBTTags';

interface ItemStackLegacy {
	blockRuntimeId?: number;
	count?: number;
	extras?: ItemStackLegacyExtras;
	metadata?: number;
	networkId: number;
}

interface ItemStackLegacyExtras {
	canDestroy: string[];
	canPlaceOn: string[];
	hasNbt: boolean;
	nbt?: NBTData<any>;
	ticking?: bigint | null;
}

class ItemLegacy extends DataType {
	public static override read(stream: BinaryStream): ItemStackLegacy {
		// Gets the network id of the value.
		const networkId = stream.readZigZag();

		// Checks if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (networkId === 0) return { networkId };

		// Read the rest of the value.
		const count = stream.readUint16(Endianness.Little);
		const metadata = stream.readVarInt();
		const blockRuntimeId = stream.readZigZag();

		// Extra data.
		const extras = stream.readVarInt();
		const hasNbt = stream.readUint16(Endianness.Little) === 0xffff;
		let nbt: NBTData<any> | undefined;
		if (hasNbt) {
			const n = stream.readByte(); // unknown prefix 0x01 is used, when zero maybe its empty NBT data
			if(n) nbt = NBTTagData.read(stream, null);
		}

		const canPlaceStrings: string[] = [];
		const canPlaceOnLength = stream.readInt32(Endianness.Little);
		for (let i = 0; i < canPlaceOnLength; i++) {
			const string = stream.readString32(Endianness.Little);
			canPlaceStrings.push(string);
		}

		const canDestroyStrings: string[] = [];
		const canDestroyLength = stream.readInt32(Endianness.Little);
		for (let i = 0; i < canDestroyLength; i++) {
			const string = stream.readString32(Endianness.Little);
			canDestroyStrings.push(string);
		}

		let ticking: bigint | null;
		// Checks if item is "minecraft:shield"
		if (networkId === 357) {
			ticking = stream.readInt64(Endianness.Little);
		} else {
			ticking = null;
		}

		const extrasObjs: ItemStackLegacyExtras = {
			canDestroy: canDestroyStrings,
			canPlaceOn: canPlaceStrings,
			hasNbt,
			nbt,
			ticking,
		};

		return {
			blockRuntimeId,
			count,
			extras: extrasObjs,
			metadata,
			networkId,
		};
	}

	public static override write(stream: BinaryStream, value: ItemStackLegacy): void {
		stream.writeZigZag(value.networkId);
		// If the item is air, we continue
		if (value.networkId === 0) return;

		stream.writeUint16(value.count!, Endianness.Little);
		stream.writeVarInt(value.metadata!);
		stream.writeZigZag(value.blockRuntimeId!);

		// Nbt data
		const extras = new BinaryStream();
		const hasNbt = value.extras!.hasNbt ? 0xffff : 0x0000;
		extras.writeUint16(hasNbt, Endianness.Little);
		if (value.extras!.hasNbt) {
			extras.writeByte(0x01);
			NBTTagData.write(extras, value.extras!.nbt!);
			// extras.write(value.extras!.nbt!);
		}

		// CanPlaceOn data
		extras.writeInt32(value.extras!.canPlaceOn.length, Endianness.Little);
		for (const string of value.extras!.canPlaceOn) {
			extras.writeString32(string, Endianness.Little);
		}

		// CanDestroy data
		extras.writeInt32(value.extras!.canDestroy.length, Endianness.Little);
		for (const string of value.extras!.canDestroy) {
			extras.writeString32(string, Endianness.Little);
		}

		// Check if item is "minecraft:shield"
		if (value.networkId === 357) {
			// I believe minecraft:shield is the only item that has this
			extras.writeInt64(0n, Endianness.Little);
		}

		// Calculate length of extras, and write it
		const buff = extras.getBuffer();
		const len = buff.byteLength;
		stream.writeVarInt(len);
		stream.writeBuffer(buff);
	}
}

export { ItemLegacy, type ItemStackLegacy, type ItemStackLegacyExtras };
