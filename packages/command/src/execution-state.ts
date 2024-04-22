import type { CommandResult } from "./types";
import type { Enum } from "./enums";
import type { CommandEntry, Commands } from "./commands";

class CommandExecutionState<O> {
	protected readonly commands: Commands<O>;

	protected readonly split: Array<string>;

	protected offset: number = 0;

	public readonly command: CommandEntry<never> | undefined;

	public readonly origin: O;

	public constructor(commands: Commands<O>, source: string, origin: O) {
		this.commands = commands;
		this.split = source.slice(1).split(" ");
		this.command = commands.entries.get(this.split[this.offset++] as string) as
			| CommandEntry<never>
			| undefined;
		this.origin = origin;
	}

	/**
	 * Try to execute the command.
	 */
	public execute(): CommandResult | undefined {
		// Check if the command is undefined.
		// If so, we will throw an error.
		if (!this.command) {
			// Throw an error.
			throw new Error(
				`Unknown command "${this.split[this.offset - 1]}". Please check that the command exists.`
			);
		}

		// TODO: Add permission checking.

		// Build the command parameters.
		const parameters = this.buildParameters();

		// Execute the command.
		return this.command.call(this.origin as never, parameters as never);
	}

	/**
	 * Read the next argument in the slice array.
	 * @returns The next argument in the slice array.
	 */
	public readNext(): string | undefined {
		return this.split[this.offset++];
	}

	/**
	 * Build the command parameters.
	 * @returns The command parameters.
	 */
	private buildParameters(): Record<string, unknown> {
		if (!this.command) {
			throw new Error("Command is undefined.");
		}

		const command = this.command as unknown as CommandEntry<{
			[key: string]: typeof Enum | [typeof Enum, boolean];
		}>;

		const object: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(command.parameters)) {
			// Get the parameter constuctor by checking if the value is an array.
			const parameter = Array.isArray(value) ? value[0] : value;

			// Check if the parameter is optional.
			const optional = Array.isArray(value) ? value[1] : false;

			// If the parameter is optional and there are no more arguments, break the loop.
			if (
				optional &&
				this.split.slice(this.offset).filter((index) => index.length).length ===
					0
			)
				break;

			// Get the next argument in the slice array.
			object[key] = parameter.extract(this);
		}

		return object;
	}
}

export { CommandExecutionState };
