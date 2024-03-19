import { BinaryStream, Endianness } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

interface ItemStackLegacyExtras {
	canDestroy: Array<string>;
	canPlaceOn: Array<string>;
	hasNbt: boolean;
	nbt?: CompoundTag<unknown> | null;
	ticking?: bigint | null;
}

class ItemLegacy extends DataType {
	public blockRuntimeId: number | null;
	public count: number | null;
	public extras: ItemStackLegacyExtras | null;
	public metadata: number | null;
	public networkId: number;

	public constructor(
		networkId: number,
		count?: number,
		metadata?: number,
		blockRuntimeId?: number,
		extras?: ItemStackLegacyExtras
	) {
		super();
		this.networkId = networkId;
		this.count = count ?? null;
		this.metadata = metadata ?? null;
		this.blockRuntimeId = blockRuntimeId ?? null;
		this.extras = extras ?? null;
	}

	public static override read(stream: BinaryStream): ItemLegacy {
		// Gets the network id of the value.
		const networkId = stream.readZigZag();

		// Checks if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (networkId === 0) return new ItemLegacy(networkId);

		// Read the rest of the value.
		const count = stream.readUint16(Endianness.Little);
		const metadata = stream.readVarInt();
		const blockRuntimeId = stream.readZigZag();

		// Extra data.
		const _extras = stream.readVarInt();
		const hasNbt = stream.readUint16(Endianness.Little) === 0xff_ff;
		let nbt: CompoundTag<unknown> | null = null;
		if (hasNbt) {
			const n = stream.readByte(); // unknown prefix 0x01 is used, when zero maybe its empty NBT data
			if (n) nbt = CompoundTag.read(stream, true, false);
		}

		const canPlaceStrings: Array<string> = [];
		const canPlaceOnLength = stream.readInt32(Endianness.Little);
		for (let index = 0; index < canPlaceOnLength; index++) {
			const string = stream.readVarString();
			canPlaceStrings.push(string);
		}

		const canDestroyStrings: Array<string> = [];
		const canDestroyLength = stream.readInt32(Endianness.Little);
		for (let index = 0; index < canDestroyLength; index++) {
			const string = stream.readVarString();
			canDestroyStrings.push(string);
		}

		let ticking: bigint | null = null;
		// Checks if item is "minecraft:shield"
		ticking = networkId === 357 ? stream.readInt64(Endianness.Little) : null;

		const extrasObjs: ItemStackLegacyExtras = {
			canDestroy: canDestroyStrings,
			canPlaceOn: canPlaceStrings,
			hasNbt,
			// @ts-ignore
			nbt: nbt as NBTCompoud,
			ticking
		};

		return new ItemLegacy(
			networkId,
			count,
			metadata,
			blockRuntimeId,
			extrasObjs
		);
	}

	public static override write(stream: BinaryStream, value: ItemLegacy): void {
		stream.writeZigZag(value.networkId);
		// If the item is air, we continue
		if (value.networkId === 0) return;

		stream.writeUint16(value.count!, Endianness.Little);
		stream.writeVarInt(value.metadata!);
		stream.writeZigZag(value.blockRuntimeId!);

		// Nbt data
		const extras = new BinaryStream();
		const hasNbt = value.extras!.hasNbt ? 0xff_ff : 0x00_00;
		extras.writeUint16(hasNbt, Endianness.Little);
		if (value.extras!.hasNbt) {
			extras.writeByte(0x01);
			// @ts-ignore
			CompoundTag.write(extras, value.extras!.nbt!, true, true);
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
		const length = buff.byteLength;
		stream.writeVarInt(length);
		stream.writeBuffer(buff);
	}
}

export { ItemLegacy, type ItemStackLegacyExtras };
