import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { AttributeModifier } from "./attribute-modifier";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { AttributeName } from "../../enums";

class Attribute extends DataType {
	/**
	 * The current value of the attribute.
	 */
	public current: number;

	/**
	 * The default value of the attribute.
	 */
	public default: number;

	/**
	 * The maximum value of the attribute.
	 */
	public max: number;

	/**
	 * The minimum value of the attribute.
	 */
	public min: number;

	/**
	 * The modifiers of the attribute.
	 */
	public modifiers: Array<AttributeModifier>;

	/**
	 * The name of the attribute.
	 */
	public name: AttributeName;

	/**
	 * Creates a new attribute.
	 *
	 * @param current The current value of the attribute.
	 * @param default_ The default value of the attribute.
	 * @param max The maximum value of the attribute.
	 * @param min The minimum value of the attribute.
	 * @param modifiers The modifiers of the attribute.
	 * @param name The name of the attribute.
	 * @returns A new attribute.
	 */
	public constructor(
		current: number,
		default_: number,
		max: number,
		min: number,
		modifiers: Array<AttributeModifier>,
		name: AttributeName
	) {
		super();
		this.current = current;
		this.default = default_;
		this.max = max;
		this.min = min;
		this.modifiers = modifiers;
		this.name = name;
	}

	public static override read(stream: BinaryStream): Array<Attribute> {
		// Prepare an array to store the attributes.
		const attributes: Array<Attribute> = [];

		// Read the number of attributes.
		const amount = stream.readVarInt();

		// We then loop through the amount of layers.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the layer.
			const min = stream.readFloat32(Endianness.Little);
			const max = stream.readFloat32(Endianness.Little);
			const current = stream.readFloat32(Endianness.Little);
			const default_ = stream.readFloat32(Endianness.Little);
			const name = stream.readVarString() as AttributeName;

			// Prepare an array to store the modifiers.
			const modifiers: Array<AttributeModifier> = [];

			// Read the number of modifiers.
			const modifierAmount = stream.readVarInt();

			// We then loop through the amount of modifiers.
			// Reading the individual fields in the stream.
			for (let index = 0; index < modifierAmount; index++) {
				modifiers.push(AttributeModifier.read(stream));
			}

			// Push the attribute to the array.
			attributes.push(
				new Attribute(current, default_, max, min, modifiers, name)
			);
		}

		// Return the attributes.
		return attributes;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<Attribute>
	): void {
		// Write the amount of attributes.
		stream.writeVarInt(value.length);

		// Loop through the attributes.
		for (const attribute of value) {
			// Write the individual fields.
			stream.writeFloat32(attribute.min, Endianness.Little);
			stream.writeFloat32(attribute.max, Endianness.Little);
			stream.writeFloat32(attribute.current, Endianness.Little);
			stream.writeFloat32(attribute.default, Endianness.Little);
			stream.writeVarString(attribute.name);

			// Write the amount of modifiers.
			stream.writeVarInt(attribute.modifiers.length);

			// Loop through the modifiers.
			for (const modifier of attribute.modifiers) {
				AttributeModifier.write(stream, modifier);
			}
		}
	}
}

export { Attribute };
