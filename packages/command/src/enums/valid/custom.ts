import { SoftEnum } from "./soft";

import type { CommandArgumentPointer } from "../../execution-state";

class CustomEnum extends SoftEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly identifier: string;

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x38;

	/**
	 * The options of the enum.
	 */
	public static readonly options: Array<string> = [];

	/**
	 * Whether the enum is strict to its options.
	 */
	public static readonly strict: boolean = true;

	/**
	 * The result of the enum.
	 */
	public readonly result: string | number | boolean;

	/**
	 * The expected options of the enum.
	 */
	public readonly options: Array<string | number | boolean>;

	/**
	 * The constructor of the enum.
	 * @param result The result of the enum.
	 * @param options The expected options of the enum.
	 */
	public constructor(result: string, options: Array<string>) {
		super();
		this.result = result;
		this.options = options;
	}

	/**
	 * Validates if the result is a valid option.
	 * @param error Whether to throw an error if the result is not a valid option.
	 * @returns Returns `true` if the result is a valid option, or `false` otherwise.
	 */
	public validate(error = false): boolean {
		// Check if the result is a valid option.
		if (this.options.includes(this.result)) return true;

		// Throw an error if the result is not a valid option.
		if (error)
			throw new TypeError(`Expected one of: ${this.options.join(", ")}`);

		// Return false if the result is not a valid option.
		return false;
	}

	public static extract(pointer: CommandArgumentPointer): CustomEnum | null {
		// Peek the next value from the pointer.
		const peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return null;

		// Check if the value can be a number or a float.
		if (+peek >= 0 || +peek <= 0) return null;

		// Check if the value can be a boolean.
		if (peek === "true" || peek === "false") return null;

		// Return the value as a string
		return new this(pointer.next() as string, this.options);
	}
}

export { CustomEnum };
