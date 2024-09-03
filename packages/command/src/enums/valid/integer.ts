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
	public readonly result: number | null;

	public constructor(result: number | null) {
		super();
		this.result = result;
	}

	public validate(_error?: boolean): boolean {
		// Check if the value is null.
		if (this.result === null) {
			// Check if we should throw an error.
			if (_error)
				throw new TypeError('Expected type "integer" after previous argument.');

			// Return false.
			return false;
		}

		// Return true.
		return true;
	}

	public static extract(pointer: CommandArgumentPointer): IntegerEnum | null {
		// Peek the next value from the pointer.
		let peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return new IntegerEnum(null);

		// Read the next value from the pointer.
		peek = pointer.next() as string;

		// Check if the value can be a boolean.
		if (peek === "true")
			// Return the value as an integer.
			return new IntegerEnum(1);

		// Check if the value can be a boolean.
		if (peek === "false")
			// Return the value as an integer.
			return new IntegerEnum(0);

		// Check if the value can be a number or a float.
		if (+peek >= 0 || +peek <= 0) return new IntegerEnum(+(peek as string));

		// Return null if the value is not a number.
		return new IntegerEnum(null);
	}
}

export { IntegerEnum };
