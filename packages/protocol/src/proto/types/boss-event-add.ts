import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { type BossEventColor, BossEventUpdateType } from "../../enums";

import type { BinaryStream } from "@serenityjs/binarystream";

class BossEventAdd extends DataType {
	public readonly name: string;
	public readonly percent: number;
	public readonly darkenScreen: number;
	public readonly color: BossEventColor;
	public readonly overlay: number;

	public constructor(
		name: string,
		percent: number,
		darkenScreen: number,
		color: BossEventColor,
		overlay: number
	) {
		super();
		this.name = name;
		this.percent = percent;
		this.darkenScreen = darkenScreen;
		this.color = color;
		this.overlay = overlay;
	}

	public static override read(
		stream: BinaryStream,
		_endian: Endianness,
		type: BossEventUpdateType
	): BossEventAdd | null {
		// Check if the type is an add event.
		if (type === BossEventUpdateType.Add) {
			// Read the fields for the add event.
			const name = stream.readVarString();
			const percent = stream.readFloat32(Endianness.Little);
			const darkenScreen = stream.readInt16(Endianness.Little);
			const color = stream.readVarInt();
			const overlay = stream.readVarInt();

			// Return the add event.
			return new this(name, percent, darkenScreen, color, overlay);
		} else {
			return null;
		}
	}

	public static override write(
		stream: BinaryStream,
		value: BossEventAdd,
		_endian: Endianness,
		type: BossEventUpdateType
	): void {
		// Check if the type is an add event.
		if (type === BossEventUpdateType.Add) {
			// Write the fields for the add event.
			stream.writeVarString(value.name);
			stream.writeFloat32(value.percent, Endianness.Little);
			stream.writeInt16(value.darkenScreen, Endianness.Little);
			stream.writeVarInt(value.color);
			stream.writeVarInt(value.overlay);
		}
	}
}

export { BossEventAdd };
