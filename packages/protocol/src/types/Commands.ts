import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

interface CommandsOverload {
	chaining: boolean;
	parameters: OverloadParameter[];
}

interface OverloadParameter {
	enumType: number;
	name: string;
	optional: boolean;
	options: number;
	valueType: number;
}

class Commands extends DataType {
	public name: string;
	public description: string;
	public flags: number;
	public permissionLevel: number;
	public alias: number;
	public subcommands: number[];
	public overloads: CommandsOverload[];

	public constructor(
		name: string,
		description: string,
		flags: number,
		permissionLevel: number,
		alias: number,
		subcommands: number[],
		overloads: CommandsOverload[],
	) {
		super();
		this.name = name;
		this.description = description;
		this.flags = flags;
		this.permissionLevel = permissionLevel;
		this.alias = alias;
		this.subcommands = subcommands;
		this.overloads = overloads;
	}

	public static override read(stream: BinaryStream): Commands[] {
		// Prepare an array to store the commands.
		const commands: Commands[] = [];

		// Read the number of commands.
		const amount = stream.readVarInt();

		// We then loop through the amount of commands.
		// Reading the string from the stream.
		for (let i = 0; i < amount; i++) {
			// Read the fields and push it to the array.
			const name = stream.readVarString();
			const description = stream.readVarString();
			const flags = stream.readUint16(Endianness.Little);
			const permissionLevel = stream.readUint8();
			const alias = stream.readInt32(Endianness.Little);

			// Prepare an array to store the subcommands.
			const subcommands: number[] = [];

			// Read the number of subcommands.
			const subcommandsAmount = stream.readVarInt();

			// We then loop through the amount of subcommands.
			for (let j = 0; j < subcommandsAmount; j++) {
				// Read the subcommand and push it to the array.
				subcommands.push(stream.readUint16(Endianness.Little));
			}

			// Prepare an array to store the overloads.
			const overloads: CommandsOverload[] = [];

			// Read the number of overloads.
			const overloadsAmount = stream.readVarInt();

			// We then loop through the amount of overloads.
			for (let j = 0; j < overloadsAmount; j++) {
				// Read the chaining and parameters.
				const chaining = stream.readBool();
				const parameters: OverloadParameter[] = [];

				// Read the number of parameters.
				const parametersAmount = stream.readVarInt();

				// We then loop through the amount of parameters.
				for (let k = 0; k < parametersAmount; k++) {
					// Read the parameter and push it to the array.
					const name = stream.readVarString();
					const valueType = stream.readUint16(Endianness.Little);
					const enumType = stream.readUint16(Endianness.Little);
					const optional = stream.readBool();
					const options = stream.readUint8();

					parameters.push({ enumType, name, optional, options, valueType });
				}

				overloads.push({ chaining, parameters });
			}

			commands.push(new Commands(name, description, flags, permissionLevel, alias, subcommands, overloads));
		}

		// Return the commands.
		return commands;
	}

	public static override write(stream: BinaryStream, value: Commands[]): void {
		// Write the number of commands given in the array.
		stream.writeVarInt(value.length);

		// Write all the commands to the stream.
		for (const { name, description, flags, permissionLevel, alias, subcommands, overloads } of value) {
			stream.writeVarString(name);
			stream.writeVarString(description);
			stream.writeUint16(flags, Endianness.Little);
			stream.writeUint8(permissionLevel);
			stream.writeInt32(alias, Endianness.Little);

			// Write the number of subcommands given in the array.
			stream.writeVarInt(subcommands.length);

			// Write all the subcommands to the stream.
			for (const subcommand of subcommands) {
				stream.writeUint16(subcommand, Endianness.Little);
			}

			// Write the number of overloads given in the array.
			stream.writeVarInt(overloads.length);

			// Write all the overloads to the stream.
			for (const { chaining, parameters } of overloads) {
				stream.writeBool(chaining);

				// Write the number of parameters given in the array.
				stream.writeVarInt(parameters.length);

				// Write all the parameters to the stream.
				for (const { enumType, name, optional, options, valueType } of parameters) {
					stream.writeVarString(name);
					stream.writeUint16(valueType, Endianness.Little);
					stream.writeUint16(enumType, Endianness.Little);
					stream.writeBool(optional);
					stream.writeUint8(options);
				}
			}
		}
	}
}

export { Commands };
