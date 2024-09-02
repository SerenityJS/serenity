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
	public readonly result: string;

	public constructor(result: string) {
		super();
		this.result = result;
	}

	public static extract(pointer: CommandArgumentPointer): StringEnum | null {
		// Peek the next value from the pointer.
		const peek = pointer.peek();

		// Check if the peek value is null.
		if (!peek) return null;

		// Check if the value can be a number or a float.
		if (+peek >= 0 || +peek <= 0) return null;

		// Check if the value can be a boolean.
		if (peek === "true" || peek === "false") return null;

		// Return the value as a string
		return new StringEnum(pointer.next() as string);
	}
}

export { StringEnum };
