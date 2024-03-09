import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';
import type { Attribute } from '../enums/index.js';

interface AttributeModifier {
	amount: number;
	id: string;
	name: string;
	operand: number;
	operation: number;
	serializable: boolean;
}

class PlayerAttributes extends DataType {
	public current: number;
	public default: number;
	public max: number;
	public min: number;
	public modifiers: AttributeModifier[];
	public name: Attribute;

	public constructor(
		current: number,
		default_: number,
		max: number,
		min: number,
		modifiers: AttributeModifier[],
		name: Attribute,
	) {
		super();
		this.current = current;
		this.default = default_;
		this.max = max;
		this.min = min;
		this.modifiers = modifiers;
		this.name = name;
	}

	public static override read(stream: BinaryStream): PlayerAttributes[] {
		// Prepare an array to store the attributes.
		const attributes: PlayerAttributes[] = [];

		// Read the number of attributes.
		const amount = stream.readVarInt();

		// We then loop through the amount of layers.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the layer.
			const min = stream.readFloat32(Endianness.Little);
			const max = stream.readFloat32(Endianness.Little);
			const current = stream.readFloat32(Endianness.Little);
			const default_ = stream.readFloat32(Endianness.Little);
			const name = stream.readVarString() as Attribute;

			// Prepare an array to store the modifiers.
			const modifiers: AttributeModifier[] = [];

			// Read the number of modifiers.
			const modifierAmount = stream.readVarInt();

			// We then loop through the amount of modifiers.
			// Reading the individual fields in the stream.
			for (let j = 0; j < modifierAmount; j++) {
				// Read all the fields for the modifier.
				const id = stream.readVarString();
				const name = stream.readVarString();
				const amount = stream.readInt32(Endianness.Little);
				const operation = stream.readInt32(Endianness.Little);
				const operand = stream.readFloat32(Endianness.Little);
				const serializable = stream.readBool();

				// Push the modifier to the array.
				modifiers.push({
					amount,
					id,
					name,
					operand,
					operation,
					serializable,
				});
			}

			// Push the attribute to the array.
			attributes.push(new PlayerAttributes(current, default_, max, min, modifiers, name));
		}

		// Return the attributes.
		return attributes;
	}

	public static override write(stream: BinaryStream, value: PlayerAttributes[]): void {
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
				// Write the individual fields.
				stream.writeVarString(modifier.id);
				stream.writeVarString(modifier.name);
				stream.writeInt32(modifier.amount, Endianness.Little);
				stream.writeInt32(modifier.operation, Endianness.Little);
				stream.writeFloat32(modifier.operand, Endianness.Little);
				stream.writeBool(modifier.serializable);
			}
		}
	}
}

export { PlayerAttributes };
