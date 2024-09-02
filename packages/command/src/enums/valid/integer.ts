import { ValidEnum } from "./valid";

import type { CommandArgumentPointer } from "../../execution-state";

class IntegerEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly identifier = "integer";

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x01;

	/**
	 * The result of the enum.
	 */
	public readonly result: number;

	public constructor(result: number) {
		super();
		this.result = result;
	}

	public static extract(pointer: CommandArgumentPointer): IntegerEnum | null {
		// Peek the next value from the pointer.
		const peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return null;

		// Check if the value can be a boolean.
		if (peek === "true") {
			// Read the next value from the pointer.
			pointer.next();

			// Return the value as an integer.
			return new IntegerEnum(1);
		}

		// Check if the value can be a boolean.
		if (peek === "false") {
			// Read the next value from the pointer.
			pointer.next();

			// Return the value as an integer.
			return new IntegerEnum(0);
		}

		// Check if the value can be a number or a float.
		if (+peek >= 0 || +peek <= 0)
			return new IntegerEnum(+(pointer.next() as string));

		// Return null if the value is not a number.
		return null;
	}
}

export { IntegerEnum };
