import { type BinaryStream, Endianness } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";
import { DataType } from "@serenityjs/raknet";
class ItemInstanceUserData extends DataType {
	/**
	 * The NBT data for the item.
	 */
	public nbt: CompoundTag | null;

	/**
	 * Blocks the item can be placed on.
	 */
	public canPlaceOn: Array<string>;

	/**
	 * Blocks the item can destroy.
	 */
	public canDestroy: Array<string>;

	/**
	 * The ticking for the item.
	 */
	public ticking?: bigint | null;

	/**
	 * Creates an instance of ItemInstanceUserData.
	 * @param nbt NBT data for the item.
	 * @param canPlaceOn Blocks the item can be placed on.
	 * @param canDestroy Blocks the item can destroy.
	 */
	public constructor(
		nbt: CompoundTag | null,
		canPlaceOn: Array<string>,
		canDestroy: Array<string>,
		ticking?: bigint | null
	) {
		super();
		this.nbt = nbt;
		this.canPlaceOn = canPlaceOn;
		this.canDestroy = canDestroy;
		this.ticking = ticking;
	}

	public static read(
		stream: BinaryStream,
		_endian: Endianness,
		id: number
	): ItemInstanceUserData {
		// Read the data marker.
		const marker = stream.readUint16(Endianness.Little);

		// Check if the marker idicates nbt data.
		// If it does, read the nbt data.
		let nbt: CompoundTag | null;
		if (marker === 0xff_ff) {
			// Read the nbt version.
			const version = stream.readInt8();

			// Handle the appropriate version.
			switch (version) {
				case 0x01: {
					// Read the compound tag.
					nbt = CompoundTag.read(stream);
					break;
				}
				default: {
					throw new Error(`Unsupported NBT formating version: ${version}`);
				}
			}
		} else {
			// Assign null to nbt, due to the lack of nbt data.
			nbt = null;
		}

		// Now we read the can place on strings.
		// These are prefixed with the length of the array (uint32).
		// Followed by a 32-bit string length, and the string itself.
		const canPlaceOn: Array<string> = [];

		// Read the length of the array.
		const canPlaceOnLength = stream.readInt32(Endianness.Little);

		// Loop through the array length.
		for (let index = 0; index < canPlaceOnLength; index++) {
			// Read the string.
			const string = stream.readString32(Endianness.Little);

			// Push the string to the array.
			canPlaceOn.push(string);
		}

		// Now we read the can destroy strings.
		// These are prefixed with the length of the array (uint32).
		// Followed by a 32-bit string length, and the string itself.
		const canDestroy: Array<string> = [];

		// Read the length of the array.
		const canDestroyLength = stream.readInt32(Endianness.Little);

		// Loop through the array length.
		for (let index = 0; index < canDestroyLength; index++) {
			// Read the string.
			const string = stream.readString32(Endianness.Little);

			// Push the string to the array.
			canDestroy.push(string);
		}

		// Check if the item is a shield.
		const ticking = id === 362 ? stream.readInt64(Endianness.Little) : null;

		// Return the instance.
		return new ItemInstanceUserData(nbt, canPlaceOn, canDestroy, ticking);
	}

	public static write(
		stream: BinaryStream,
		value: ItemInstanceUserData,
		_endian: Endianness,
		id: number
	): void {
		// Check if the nbt is null.
		if (value.nbt) {
			// Write the nbt marker for nbt data.
			stream.writeUint16(0xff_ff, Endianness.Little);

			// Write the nbt version.
			stream.writeInt8(0x01);

			// Write the compound tag.
			CompoundTag.write(stream, value.nbt, false);
		} else {
			// Write the nbt marker for no nbt data.
			stream.writeUint16(0x00_00, Endianness.Little);
		}

		// Write the can place on strings.
		// Write the length of the array.
		stream.writeInt32(value.canPlaceOn.length, Endianness.Little);

		// Loop through the array.
		for (const string of value.canPlaceOn) {
			// Write the string.
			stream.writeString32(string, Endianness.Little);
		}

		// Write the can destroy strings.
		// Write the length of the array.
		stream.writeInt32(value.canDestroy.length, Endianness.Little);

		// Loop through the array.
		for (const string of value.canDestroy) {
			// Write the string.
			stream.writeString32(string, Endianness.Little);
		}

		// Check if the item is a shield.
		if (id === 362) {
			stream.writeInt64(value.ticking ?? BigInt(0), Endianness.Little);
		}
	}
}

export { ItemInstanceUserData };
