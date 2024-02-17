import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import type { AbilityLayerType } from '../enums/index.js';
import { AbilityLayerFlag } from '../enums/index.js';

interface AbilityFlag {
	flag: AbilityLayerFlag;
	value: boolean;
}

interface EncodedAbilityFlags {
	flagsHash: number;
	valuesHash: number;
}

class AbilityLayers extends DataType {
	public flags: AbilityFlag[];
	public flySpeed: number;
	public type: AbilityLayerType;
	public walkSpeed: number;

	public constructor(flags: AbilityFlag[], flySpeed: number, type: AbilityLayerType, walkSpeed: number) {
		super();
		this.flags = flags;
		this.flySpeed = flySpeed;
		this.type = type;
		this.walkSpeed = walkSpeed;
	}

	public static override read(stream: BinaryStream): AbilityLayers[] {
		// Prepare an array to store the layers.
		const layers: AbilityLayers[] = [];

		// Read the number of layers.
		const amount = stream.readUint8();

		// We then loop through the amount of layers.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the layer.
			const type: AbilityLayerType = stream.readUint16(Endianness.Little);
			const allowed = stream.readUint32(Endianness.Little);
			const enabled = stream.readUint32(Endianness.Little);
			const flags = this.decodeFlags({ flagsHash: allowed, valuesHash: enabled });
			const flySpeed = stream.readFloat32(Endianness.Little);
			const walkSpeed = stream.readFloat32(Endianness.Little);

			// Push the layer to the array.
			layers.push(new AbilityLayers(flags, flySpeed, type, walkSpeed));
		}

		// Return the layers.
		return layers;
	}

	public static override write(stream: BinaryStream, value: AbilityLayers[]): void {
		// Write the amount of layers.
		stream.writeUint8(value.length);

		// Loop through the layers.
		for (const layer of value) {
			// Write the individual fields.
			stream.writeUint16(layer.type, Endianness.Little);
			const { flagsHash, valuesHash } = this.encodeFlags(layer.flags);
			stream.writeUint32(flagsHash, Endianness.Little);
			stream.writeUint32(valuesHash, Endianness.Little);
			stream.writeFloat32(layer.flySpeed, Endianness.Little);
			stream.writeFloat32(layer.walkSpeed, Endianness.Little);
		}
	}

	public static encodeFlags(flags: AbilityFlag[]): EncodedAbilityFlags {
		let flagsHash = 0;
		let valuesHash = 0;
		for (const { flag, value } of flags) {
			flagsHash |= 1 << flag;

			if (flag === AbilityLayerFlag.WalkSpeed || flag === AbilityLayerFlag.FlySpeed) continue;
			valuesHash |= value ? 1 << flag : 0;
		}

		return {
			flagsHash,
			valuesHash,
		};
	}

	public static decodeFlags(encoded: EncodedAbilityFlags): AbilityFlag[] {
		const flags: AbilityFlag[] = [];
		for (const flag of Object.values(AbilityLayerFlag)) {
			if (flag === AbilityLayerFlag.WalkSpeed || flag === AbilityLayerFlag.FlySpeed) continue;
			flags.push({
				flag: flag as AbilityLayerFlag,
				value: (encoded.valuesHash & (1 << (flag as AbilityLayerFlag))) !== 0,
			});
		}

		return flags;
	}
}

export { AbilityLayers };
