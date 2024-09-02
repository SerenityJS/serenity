import { CustomEnum } from "./custom";

import type { CommandArgumentPointer } from "../../execution-state";

class BooleanEnum extends CustomEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly identifier = "boolean";

	/**
	 * The options of the enum.
	 */
	public static readonly options = ["true", "false"];

	/**
	 * Whether the enum is strict to its options.
	 */
	public static readonly strict = true;

	/**
	 * The result of the enum.
	 */
	public readonly result: boolean;

	/**
	 * Creates an instance of boolean enum.
	 * @param result The result of the enum.
	 */
	public constructor(result: boolean) {
		super(result.toString(), BooleanEnum.options);
		this.result = result;
	}

	/**
	 * Checks if the enum value is applicable.
	 * @param error Whether to throw an error if the enum value is not applicable.
	 * @returns Returns `true` if the enum value is applicable, or `false` otherwise.
	 */
	public validate(error?: boolean): boolean {
		// Check if the result is either true or false.
		if (this.result === true || this.result === false) return true;

		// Throw an error if the result is not a valid boolean.
		if (error)
			throw new TypeError(`Expected one of: ${BooleanEnum.options.join(", ")}`);

		// Return false if the result is not a valid boolean.
		return false;
	}

	public static extract(pointer: CommandArgumentPointer): BooleanEnum | null {
		// Peek the next value from the pointer.
		const peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return null;

		// Check if the value can be a boolean.
		if (peek === "true") {
			// Read the next value from the pointer.
			pointer.next();

			// Return the value as a boolean.
			return new BooleanEnum(true);
		}

		// Check if the value can be a boolean.
		if (peek === "false") {
			// Read the next value from the pointer.
			pointer.next();

			// Return the value as a boolean.
			return new BooleanEnum(false);
		}

		// Return null if the value is not a boolean.
		return null;
	}
}

export { BooleanEnum };
