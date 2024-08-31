import type { ArgumentsCamelCase, Argv } from "yargs";

abstract class CliCommand {
	/**
	 * The name of the command.
	 */
	public abstract name: string;
	/**
	 * The description of the command.
	 */
	public abstract description: string;

	/**
	 * Registers the command and his flags
	 * @param registry The registry to register the command with.
	 */
	public abstract register(registry: Argv): void;

	/**
	 * Executes the command logic.
	 */
	public abstract handle(options: ArgumentsCamelCase): Promise<void>;
}

export { CliCommand };
