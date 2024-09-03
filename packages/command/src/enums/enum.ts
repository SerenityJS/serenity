import type { CommandArgumentPointer } from "../execution-state";

class Enum {
	public static readonly enums = new Map<string, Enum>();

	public static readonly identifier: string;

	public static readonly type: number;

	public static readonly symbol: number;

	public static readonly default = new Enum();

	/**
	 * Whether the enum value is optional.
	 */
	public optional = true;

	public result: unknown;

	public constructor(..._arguments: Array<unknown>) {
		this;
	}

	/**
	 * Checks if the enum value is applicable.
	 * @param error Whether to throw an error if the enum value is not applicable.
	 * @returns Returns `true` if the enum value is applicable, or `false` otherwise.
	 */
	public validate(_error = false): boolean {
		// Check if we should throw an error.
		if (_error) throw new Error("Expected value after previous argument.");

		// Return false.
		return false;
	}

	/**
	 * Reads the next value from the pointer.
	 * @param pointer The pointer to read from.
	 */
	public static extract(_pointer: CommandArgumentPointer): Enum | null {
		throw new Error("Enum.extract() has not been implemented.");
	}
}

export { Enum };
