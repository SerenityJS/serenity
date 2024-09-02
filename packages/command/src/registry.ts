/* eslint-disable @typescript-eslint/unified-signatures */
import { CommandPermissionLevel } from "@serenityjs/protocol";

import type {
	CommandArguments,
	CommandCallback,
	CommandOverload
} from "./types";

class CommandRegistry<O> {
	/**
	 * The overloads of the command.
	 */
	public readonly overloads = new Map<CommandOverload, CommandCallback>();

	/**
	 * The will make the command appear with a `debug` flag in the available commands list.
	 */
	public debug = false;

	/**
	 * The permission level required to execute the command.
	 */
	public permissionLevel = CommandPermissionLevel.Normal;

	/**
	 * Overloads the command with the given options.
	 * @param options The options of the overload.
	 */
	public overload<T extends CommandOverload>(options: T): this;

	/**
	 * Overloads the command with the given options and callback.
	 * @param options The options of the overload.
	 * @param callback The callback of the overload.
	 */
	public overload<T extends CommandOverload>(
		options: T,
		callback: CommandCallback<CommandArguments<T>, O>
	): this;

	/**
	 * Overloads the command with the given options and callback.
	 * @param options The options of the overload.
	 * @param callback The callback of the overload
	 */
	public overload<T extends CommandOverload>(
		options: T,
		callback?: CommandCallback<CommandArguments<T>, O>
	): this {
		if (callback) {
			this.overloads.set(options, callback as CommandCallback);
		} else {
			this.overloads.set(options, () => {});
		}

		// Return the registry.
		return this;
	}
}

export { CommandRegistry };
