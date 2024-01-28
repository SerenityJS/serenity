import { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { Byte } from '@serenityjs/nbt';
import type { NBTSerializable, NBTCompoud } from '@serenityjs/nbt';
import { DataType } from '@serenityjs/raknet-protocol';
import { NBTTagItemData } from './NBTTypes';

interface ItemEntry {
	blockRuntimeId?: number | null;
	count: number | null;
	extras: ItemExtras | null;
	hasStackId: boolean | null;
	metadata: number | null;
	networkId: number;
	stackId: number | null;
}

interface ItemExtras {
	canDestroy: string[];
	canPlaceOn: string[];
	hasNbt: boolean;
	nbt?: NBTCompoud;
	ticking?: bigint | null;
}

class Item extends DataType {
	public static override read(stream: BinaryStream): ItemEntry {
		// Gets the network id of the value.
		const networkId = stream.readZigZag();

		// Checks if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (networkId === 0)
			return {
				count: null,
				extras: null,
				hasStackId: null,
				metadata: null,
				networkId,
				stackId: null,
			};

		// Read the rest of the value.
		const count = stream.readUint16(Endianness.Little);
		const metadata = stream.readVarInt();
		const hasStackId = stream.readBool();

		// Prepare the stack id.
		let stackId: number | null = null;

		// Check if the stack id is true.
		if (hasStackId) {
			// Read the stack id.
			stackId = stream.readVarInt();
		}

		const blockRuntimeId = stream.readZigZag();

		// Extra data.
		const extras = stream.readVarInt();
		const hasNbt = stream.readUint16(Endianness.Little) === 0xffff;
		let nbt: NBTSerializable = Byte(0);
		if (hasNbt) {
			const n = stream.readByte(); // unknown prefix 0x01 is used, when zero maybe its empty NBT data
			if (n) nbt = NBTTagItemData.read(stream, null);
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

		const extrasObjs: ItemExtras = {
			canDestroy: canDestroyStrings,
			canPlaceOn: canPlaceStrings,
			hasNbt,
			nbt: nbt as NBTCompoud,
			ticking,
		};

		return {
			blockRuntimeId,
			count,
			extras: extrasObjs,
			hasStackId,
			metadata,
			networkId,
			stackId,
		};
	}

	public static override write(stream: BinaryStream, value: ItemEntry): void {
		// Write the network id.
		stream.writeZigZag(value.networkId);

		// Check if the network id is 0.
		if (value.networkId === 0) return;

		// Write the rest of the value.
		stream.writeUint16(value.count ?? 0, Endianness.Little);
		stream.writeVarInt(value.metadata ?? 0);
		stream.writeBool(value.hasStackId ?? false);

		// Check if the stack id is true.
		if (value.hasStackId) {
			// Write the stack id.
			stream.writeVarInt(value.stackId ?? 0);
		}

		stream.writeZigZag(value.blockRuntimeId ?? 0);

		// Extra data.
		const extras = new BinaryStream();
		const hasNbt = value.extras!.hasNbt ? 0xffff : 0x0000;
		extras.writeUint16(hasNbt, Endianness.Little);
		if (value.extras!.hasNbt) {
			extras.writeByte(0x01);
			NBTTagItemData.write(extras, value.extras!.nbt!);
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

export { Item, type ItemEntry, type ItemExtras };
