import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { AbilitySet } from "./ability-set";

import type { AbilityLayerType } from "../../enums";
import type { BinaryStream } from "@serenityjs/binarystream";

class AbilityLayer extends DataType {
	/**
	 * The type of the layer.
	 */
	public readonly type: AbilityLayerType;

	/**
	 * The abilities of the layer.
	 */
	public readonly abilities: Array<AbilitySet>;

	/**
	 * The fly speed of the layer.
	 */
	public readonly flySpeed: number;

	/**
	 * The walk speed of the layer.
	 */
	public readonly walkSpeed: number;

	/**
	 * Creates a new ability layer.
	 * @param type The type of the layer.
	 * @param abilities The abilities of the layer.
	 * @param flySpeed The fly speed of the layer.
	 * @param walkSpeed The walk speed of the layer.
	 */
	public constructor(
		type: AbilityLayerType,
		abilities: Array<AbilitySet>,
		flySpeed: number,
		walkSpeed: number
	) {
		super();
		this.type = type;
		this.abilities = abilities;
		this.flySpeed = flySpeed;
		this.walkSpeed = walkSpeed;
	}

	public static read(stream: BinaryStream): Array<AbilityLayer> {
		// Prepare an array to store the layers.
		const layers: Array<AbilityLayer> = [];

		// Read the number of layers.
		const amount = stream.readUint8();

		// We then loop through the amount of layers.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the layer.
			const type: AbilityLayerType = stream.readUint16(Endianness.Little);
			const abilities = AbilitySet.read(stream);
			const flySpeed = stream.readFloat32(Endianness.Little);
			const walkSpeed = stream.readFloat32(Endianness.Little);

			// Push the layer to the array.
			layers.push(new AbilityLayer(type, abilities, flySpeed, walkSpeed));
		}

		// Return the layers.
		return layers;
	}

	public static write(stream: BinaryStream, value: Array<AbilityLayer>): void {
		// Write the amount of layers.
		stream.writeUint8(value.length);

		// Loop through the layers.
		for (const layer of value) {
			// Write the individual fields.
			stream.writeUint16(layer.type, Endianness.Little);
			AbilitySet.write(stream, layer.abilities);
			stream.writeFloat32(layer.flySpeed, Endianness.Little);
			stream.writeFloat32(layer.walkSpeed, Endianness.Little);
		}
	}
}

export { AbilityLayer };
