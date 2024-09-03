import { Enum } from "./enums";

import type { Command } from "./command";
import type { CommandContext, CommandResponse } from "./types";

export class CommandArgumentPointer<O = unknown> {
	/**
	 * The arguments that were passed to the command.
	 */
	public readonly arguments: Array<string>;

	/**
	 * The state of the command execution.
	 */
	public readonly state: CommandExecutionState<O>;

	/**
	 * The offset of the arguments.
	 */
	public offset = 0;

	/**
	 * Creates a new command argument pointer.
	 * @param state The state of the command execution.
	 * @param arguments The arguments that were passed to the command.
	 */
	public constructor(
		state: CommandExecutionState<O>,
		arguments_: Array<string>
	) {
		this.state = state;
		this.arguments = arguments_;
	}

	/**
	 * Peeks the next argument.
	 * @returns The next argument or null if there are no more arguments.
	 */
	public peek(): string | null {
		return this.arguments[this.offset] || null;
	}

	/**
	 * Gets the next argument.
	 * @returns The next argument or null if there are no more arguments.
	 */
	public next(): string | null {
		return this.arguments[this.offset++] || null;
	}
}

class CommandExecutionState<O> {
	/**
	 * The split arguments of the command.
	 */
	protected readonly split: Array<string>;

	/**
	 * The command that was executed.
	 */
	public readonly command: Command<unknown, O> | undefined;

	/**
	 * The origin of the command execution.
	 */
	public readonly origin: O;

	public constructor(
		commands: Array<Command<unknown, O>>,
		source: string,
		origin: O
	) {
		this.split = this.parse(source);

		// Get the name of the command from the split array.
		const name = this.split.shift();

		// Find the command from the commands
		this.command = commands.find((command) => command.name === name);
		this.origin = origin;
	}

	/**
	 * Attempts to execute the command.
	 * @returns
	 */
	public execute(): CommandResponse {
		// Check if the command is undefined.
		// If it is, we will throw an error.
		if (!this.command) {
			throw new TypeError(
				`Unknown command executed. Please make sure the command exists, and that you have permission to use it.`
			);
		}

		// Create a global context object with the origin.
		const globalContext = { origin: this.origin } as CommandContext<
			Record<string, unknown>,
			O
		>;

		// Iterate through the overloads and extract the arguments.
		for (const [overload, callback] of this.command.registry.overloads) {
			// Create a new context object with the origin.
			const context = { origin: this.origin } as CommandContext<
				Record<string, Enum>,
				O
			>;

			// Create a new state object with the split array.
			const state = new CommandArgumentPointer<O>(this, this.split);

			// Iterate through the overload keys and extract the arguments.
			for (const key in overload) {
				// Get the value of the key
				const value = overload[key];

				// Check if the value is null or undefined, if it is then we will continue to the next overload
				if (!value) continue;

				// Check if the value is an array, if it is then we will check if the argument is required.
				if (Array.isArray(value)) {
					// Get the enum and optional flag from the value.
					const [type, optional] = value;

					// Check if the argument is optional and if there are any arguments left.
					if (!optional && state.offset >= state.arguments.length) {
						throw new TypeError(`Argument ${key} is required.`);
					}

					// Extract the argument from the split array.
					// We will pass the execution state to the extract method.
					// This allows customs enums to extract the argument in various ways.
					const value_ = type.extract(state as CommandArgumentPointer);

					// Declare if the value is optional.
					if (value_) value_.optional = optional;

					// Add the value to the context object.
					context[key] = value_ ?? type.default;
				} else {
					// Extract the argument from the split array.
					// We will pass the execution state to the extract method.
					// This allows customs enums to extract the argument in various ways.
					const value_ = value.extract(state as CommandArgumentPointer);

					// Declare that the enum value is not optional.
					if (value_) value_.optional = false;

					// Add the value to the context object.
					context[key] = value_ ?? value.default;
				}
			}

			// Add the context object to the global context object.
			Object.assign(globalContext, context);

			// Check if there are any arguments left in the split array.
			// If there are, we will continue to the next overload.
			if (state.offset < state.arguments.length) continue;

			// Check that the length of the context object is the same as the overload object.
			// We need to add 1 to compensate for the origin property.
			if (Object.keys(context).length !== Object.keys(overload).length + 1)
				continue;

			// Iterate through the context onject and try to validate the arguments.
			for (const [_, value] of Object.entries(context)) {
				// Check if the value is an instance of Enum.
				if (!(value instanceof Enum)) continue;

				// Get the result from the value.
				const result = value.result;

				// Check if the value is optional and if it is not valid.
				if (value.optional && (result === null || result === undefined))
					continue;

				// Validate the value.
				value.validate(true);
			}

			// Get the response from the callback.
			return callback(context) ?? {};
		}

		// Call the global callback with the global context object.
		return this.command.callback(globalContext) ?? {};
	}

	protected parse(source: string): Array<string> {
		// Create a new regex object to match
		const regex = /"([^"]+)"|(\S+)/g;
		const arguments_ = [];

		// Iterate through the source string and extract the arguments
		let match = null;
		while ((match = regex.exec(source))) {
			arguments_.push(match[1] || match[2]);
		}

		// Return the arguments array.
		return arguments_ as Array<string>;
	}
}

export { CommandExecutionState };
