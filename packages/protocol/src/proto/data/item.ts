import { BinaryStream, Endianness } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

interface ItemExtras {
	canDestroy: Array<string>;
	canPlaceOn: Array<string>;
	hasNbt: boolean;
	nbt?: unknown;
	ticking?: bigint | null;
}

class Item extends DataType {
	public blockRuntimeId?: number;
	public count?: number;
	public extras?: ItemExtras;
	public hasStackId?: boolean;
	public metadata?: number;
	public networkId: number;
	public stackId?: number;

	public constructor(
		networkId: number,
		count?: number,
		metadata?: number,
		blockRuntimeId?: number,
		extras?: ItemExtras,
		hasStackId?: boolean,
		stackId?: number
	) {
		super();
		this.networkId = networkId;
		this.count = count;
		this.metadata = metadata;
		this.blockRuntimeId = blockRuntimeId;
		this.extras = extras;
		this.hasStackId = hasStackId;
		this.stackId = stackId;
	}

	public static read(stream: BinaryStream): Item {
		// Gets the network id of the value.
		const networkId = stream.readZigZag();

		// Checks if the network id is 0.
		// If it is, then we return an empty value. (air)
		if (networkId === 0) return new Item(networkId);

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
		const _extras = stream.readVarInt();
		const hasNbt = stream.readUint16(Endianness.Little) === 0xff_ff;
		let nbt: number | null = null;
		if (hasNbt) {
			const n = stream.readByte(); // unknown prefix 0x01 is used, when zero maybe its empty NBT data
			nbt = n;
		}

		const canPlaceStrings: Array<string> = [];
		const canPlaceOnLength = stream.readInt32(Endianness.Little);
		for (let index = 0; index < canPlaceOnLength; index++) {
			const string = stream.readString32(Endianness.Little);
			canPlaceStrings.push(string);
		}

		const canDestroyStrings: Array<string> = [];
		const canDestroyLength = stream.readInt32(Endianness.Little);
		for (let index = 0; index < canDestroyLength; index++) {
			const string = stream.readString32(Endianness.Little);
			canDestroyStrings.push(string);
		}

		let ticking: bigint | null = null;
		// Checks if item is "minecraft:shield"
		ticking = networkId === 357 ? stream.readInt64(Endianness.Little) : null;

		const extrasObjs: ItemExtras = {
			canDestroy: canDestroyStrings,
			canPlaceOn: canPlaceStrings,
			hasNbt,
			// @ts-ignore
			nbt: nbt as NBTCompoud,
			ticking
		};

		return new Item(
			networkId,
			count,
			metadata,
			blockRuntimeId,
			extrasObjs,
			hasStackId,
			stackId ?? 0
		);
	}

	public static write(stream: BinaryStream, value: Item): void {
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
		const hasNbt = value.extras!.hasNbt ? 0xff_ff : 0x00_00;
		extras.writeUint16(hasNbt, Endianness.Little);
		if (value.extras!.hasNbt) {
			extras.writeByte(0x01);
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

export { Item, type ItemExtras };
