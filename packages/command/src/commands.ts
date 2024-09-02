import { AvailableCommandsPacket } from "@serenityjs/protocol";

import { Command } from "./command";
import { CommandRegistry } from "./registry";
import { SoftEnum } from "./enums/valid/soft";

import type { CustomEnum } from "./enums/valid/custom";
import type {
	CommandCallback,
	CommandContext,
	CommandRegistryCallback
} from "./types";

class Commands<O> {
	/**
	 * The commands of the registry.
	 */
	public readonly commands = new Map<string, Command<unknown, O>>();

	/**
	 * Gets all the commands in the registry.
	 * @returns All the commands in the registry.
	 */
	public getAll(): Array<Command<unknown, O>> {
		return [...this.commands.values()];
	}

	/**
	 * Gets a command by its name.
	 * @param name The name of the command.
	 * @returns The command or undefined if it does not exist.
	 */
	public get(name: string): Command<unknown, O> | undefined {
		// Check if the name starts with a slash.
		if (name.startsWith("/")) {
			// Remove the slash from the name.
			name = name.slice(1);
		}

		// Get the first word of the name.
		name = name.split(" ")[0] as string;

		// Return the command by the name.
		return this.commands.get(name);
	}

	/**
	 * Registers a new command in the registry.
	 * @param name The name of the command.
	 * @param description The description of the command.
	 * @param callback The callback of the command.
	 * @returns The command that was registered.
	 */
	public register<K = NonNullable<unknown>, T = CommandContext<K>>(
		name: string,
		description: string,
		callback: CommandCallback<T, O>
	): Command<T, O>;

	/**
	 * Registers a new command in the registry.
	 * @param name  The name of the command.
	 * @param description The description of the command.
	 * @param registry The registry of the command.
	 * @param callback The callback of the command.
	 * @returns The command that was registered.
	 */
	public register<K = NonNullable<unknown>, T = CommandContext<K>>(
		name: string,
		description: string,
		registry: CommandRegistryCallback<O>,
		callback: CommandCallback<T, O>
	): Command<T, O>;

	/**
	 * Registers a new command in the registry.
	 * @param name The name of the command.
	 * @param description The description of the command.
	 * @param registry The registry of the command.
	 * @param callback The callback of the command.
	 * @returns The command that was registered.
	 */
	public register<K = NonNullable<unknown>, T = CommandContext<K>>(
		name: string,
		description: string,
		registry: CommandRegistryCallback<O> | CommandCallback<T, O>,
		callback?: CommandCallback<T, O>
	): Command<T, O> {
		// Create a new registry instance
		const regInstance = new CommandRegistry<O>();

		// Get the callback from the arguments
		const execCallback = callback ?? (registry as CommandCallback<T, O>);

		const regCallback = callback
			? (registry as CommandRegistryCallback<O>)
			: () => {};

		// Execute the registry callback
		regCallback(regInstance);

		// Create a new command instance
		const command = new Command<T, O>(
			name,
			description,
			regInstance,
			execCallback
		);

		// Set the command in the commands map
		this.commands.set(name, command as Command<unknown, O>);

		// Return the command
		return command;
	}

	/**
	 * Unregisters a command from the registry by its name.
	 * @param name - The name of the command to be unregistered.
	 * @remarks
	 * This method removes the command associated with the given name from the registry.
	 * If the command does not exist in the registry, this method does nothing.
	 */
	public unregister(name: string): void {
		this.commands.delete(name);
	}

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
				permissionLevel: command.registry.permissionLevel,
				subcommands: [],
				flags: command.registry.debug ? 1 : 0,
				alias: -1,
				overloads: [...command.registry.overloads.keys()].map((overload) => {
					// Iterate through the keys of the overload and extract the parameters.
					const parameters = Object.entries(overload).map(([name, value]) => {
						// Get the parameter constructor by checking if the value is an array.
						const enm = Array.isArray(value) ? value[0] : value;

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

						// Add the question mark to the name if the parameter is optional.
						name = optional ? name + "?" : name;

						return {
							symbol,
							name,
							optional,
							options: 0
						};
					});

					return {
						chaining: false,
						parameters
					};
				})
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

export { Commands };
