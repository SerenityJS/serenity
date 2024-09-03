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
	public readonly result: string | number | boolean | null;

	/**
	 * The expected options of the enum.
	 */
	public readonly options: Array<string | number | boolean>;

	/**
	 * The constructor of the enum.
	 * @param result The result of the enum.
	 * @param options The expected options of the enum.
	 */
	public constructor(result: string | null, options: Array<string>) {
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
		if (error && this.result === null)
			throw new TypeError(
				`Expected one of "${this.options.join(", ")}" after previous argument.`
			);

		// Check if the result is null.
		if (this.result === null) return false;

		// Check if the result is a valid option.
		if (!this.options.includes(this.result) && error) {
			throw new TypeError(
				`Expected one of "${this.options.join(", ")}" after previous argument.`
			);
		}

		// Return whether the result is a valid option.
		return this.options.includes(this.result);
	}

	public static extract(pointer: CommandArgumentPointer): CustomEnum | null {
		// Peek the next value from the pointer.
		let peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return new this(null, this.options);

		// Read the next value from the pointer.
		peek = pointer.next() as string;

		// Check if the value can be a number or a float.
		if (+peek >= 0 || +peek <= 0) return new this(null, this.options);

		// Check if the value can be a boolean.
		if (peek === "true" || peek === "false")
			return new this(null, this.options);

		// Return the value as a string
		return new this(peek, this.options);
	}
}

export { CustomEnum };
