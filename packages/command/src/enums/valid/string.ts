import { ValidEnum } from "./valid";

import type { CommandArgumentPointer } from "../../execution-state";

class StringEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly identifier = "string";

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
	public static readonly strict = true;

	/**
	 * The result of the enum.
	 */
	public readonly result: string | null;

	public constructor(result: string | null) {
		super();
		this.result = result;
	}

	public validate(_error?: boolean): boolean {
		// Check if the value is null.
		if (this.result === null) {
			// Check if we should throw an error.
			if (_error)
				throw new TypeError('Expected type "string" after previous argument.');

			// Return false.
			return false;
		}

		// Return true.
		return true;
	}

	public static extract(pointer: CommandArgumentPointer): StringEnum | null {
		// Peek the next value from the pointer.
		let peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return new StringEnum(null);

		// Read the next value from the pointer.
		peek = pointer.next() as string;

		// Check if the value can be a number or a float.
		if (+peek >= 0 || +peek <= 0) return new StringEnum(null);

		// Check if the value can be a boolean.
		if (peek === "true" || peek === "false") return new StringEnum(null);

		// Return the value as a string
		return new StringEnum(peek);
	}
}

export { StringEnum };
