import type { CommandResult } from "./types";
import type { Enum } from "./enums";
import type { PermissionLevel } from "@serenityjs/protocol";

interface CommandParameters {
	[key: string]: typeof Enum | [typeof Enum, boolean];
}

interface CommandOptions {
	permission?: PermissionLevel;
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
}

export { Commands, CommandEntry, CommandParameters };
