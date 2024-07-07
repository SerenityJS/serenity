import {
	AvailableCommandsPacket,
	CommandPermissionLevel
} from "@serenityjs/protocol";

import { type CustomEnum, SoftEnum, type Enum } from "./enums";

import type { CommandResult } from "./types";

interface CommandParameters {
	[key: string]: typeof Enum | [typeof Enum, boolean];
}

interface CommandOptions {
	permission?: CommandPermissionLevel;
	special?: boolean;
}

interface CommandPartial<O, T extends CommandParameters> {
	name: string;
	description: string;
	parameters: T;
	call: CommandCallable<O, T>;
}

type CommandEntry<
	O,
	T extends CommandParameters = CommandParameters
> = CommandPartial<O, T> & CommandOptions;

type CommandCallable<O, T extends CommandParameters> = (
	origin: O,
	parameters: {
		[K in keyof T]: T[K] extends [typeof Enum, boolean]
			? T[K][0]["prototype"]
			: T[K] extends typeof Enum
				? T[K]["prototype"]
				: T[K] | Enum;
	}
) => CommandResult | undefined;

class Commands<O> {
	/**
	 * A collection registry of all commands.
	 */
	public readonly entries: Map<string, CommandEntry<O>>;

	/**
	 * Construct a new commands instance.
	 * @param commands The commands to register.
	 */
	public constructor(commands?: Map<string, CommandEntry<O>>) {
		this.entries = commands ?? new Map();
	}

	/**
	 * Register a new command.
	 * @param name The name of the command.
	 * @param description The description of the command.
	 * @param callback The callback to execute when the command is called.
	 * @param parameters The parameters of the command.
	 * @param options Additional options for the command.
	 * @returns The command entry.
	 */
	public register<T extends CommandParameters>(
		name: string,
		description: string,
		callback: CommandCallable<O, T>,
		parameters?: T,
		options?: CommandOptions
	): CommandEntry<O, T> {
		// Throw an error if the command already exists.
		if (this.entries.has(name)) {
			throw new Error(
				`Command "${name}" is already registered. Unregister the existing command first, or rename the new command.`
			);
		}

		// Create the command entry.
		const entry: CommandEntry<O, T> = {
			name,
			description,
			parameters: parameters ?? ({} as T),
			...options,
			call: callback as CommandCallable<O, T>
		};

		// Store the command entry in the commands map.
		this.entries.set(
			name,
			entry as unknown as CommandEntry<
				O,
				{
					[key: string]: typeof Enum | [typeof Enum, boolean];
				}
			>
		);

		// Return the command entry.
		return entry;
	}

	/**
	 * Unregister a command.
	 * @param name The name of the command to unregister.
	 */
	public unregister(name: string): void {
		this.entries.delete(name);
	}

	/**
	 * Get a command entry.
	 * @param name The name of the command to get.
	 * @returns The command entry.
	 */
	public get(name: string): CommandEntry<O> | undefined {
		return this.entries.get(name);
	}

	/**
	 * Get all command entries.
	 * @returns All command entries.
	 */
	public getAll(): Array<CommandEntry<O>> {
		return [...this.entries.values()];
	}

	/**
	 * Serializse the commands to an available commands packet.
	 * @returns The available commands packet.
	 */
	public serialize(): AvailableCommandsPacket {
		// Create a new available commands packet
		const packet = new AvailableCommandsPacket();

		// Holds all custom enums that are used in the commands
		packet.dynamicEnums = [];

		// Map the commands to the packet property
		packet.commands = this.getAll().map((command) => {
			return {
				name: command.name,
				description: command.description,
				permissionLevel: command.permission ?? CommandPermissionLevel.Normal,
				subcommands: [],
				flags: command.special ? 1 : 0,
				alias: -1,
				overloads: [
					{
						chaining: false,
						parameters: Object.entries(command.parameters).map(
							([name, value]) => {
								// Get the parameter constuctor by checking if the value is an array.
								const enm = Array.isArray(value) ? value[0] : value;

								// TODO: Clean this up
								// Get the name of the parameter.
								const symbol =
									enm.type === SoftEnum.type
										? (enm as typeof CustomEnum).options.length > 0
											? (0x4_10 << 16) |
												(packet.dynamicEnums.push({
													name: enm.name,
													values: (enm as typeof CustomEnum).options
												}) -
													1)
											: enm.symbol
										: enm.symbol;

								// Check if the parameter is optional.
								const optional = Array.isArray(value) ? value[1] : false;

								return {
									symbol,
									name,
									optional,
									options: 0
								};
							}
						)
					}
				]
			};
		});

		// Assign the remaining properties to the packet
		packet.chainedSubcommandValues = [];
		packet.subcommands = [];
		packet.enumConstraints = [];
		packet.enumValues = [];
		packet.enums = [];
		packet.postFixes = [];

		// Return the packet
		return packet;
	}
}

export { Commands, CommandEntry, CommandParameters };
