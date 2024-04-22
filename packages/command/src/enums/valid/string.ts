import { ValidEnum } from "./valid";

import type { CommandExecutionState } from "../../execution-state";

class StringEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly name = "string";

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x38;

	/**
	 * The result of the enum.
	 */
	public readonly result: string;

	public constructor(result: string) {
		super();
		this.result = result;
	}

	public static extract<O>(
		state: CommandExecutionState<O>
	): StringEnum | undefined {
		// Read next argument in slice array.
		const text = state.readNext();

		// Ensure the argument is valid and defined.
		if (typeof text === "string") {
			// If an empty string call extract again to try next argument.
			if (text.length === 0) return this.extract(state);

			// If text starts with quotation its a string scope.
			if (text.startsWith('"')) {
				// Create array to hold the final scope.
				const final = [];

				// Create variable i and assign to current argument
				// While i is a typeof string continue looping
				// After every increment assign i to next argument
				for (
					let index: string | undefined = text;
					typeof index === "string";
					index = state.readNext()
				) {
					// Push current argument to final scope array.
					final.push(index);

					// If current argument endswith quotation and its not the
					// first quotation mark, scope was ended so stop loop.
					if (index.endsWith('"') && (index.length > 1 || final.length > 1))
						break;
				}

				// If last element in final string scope does end with
				// a quatation then its a closed scope so return.
				if (final.at(-1)?.endsWith('"'))
					return new StringEnum(final.join(" ").slice(1).slice(0, -1));
				// Otherwise its an unclosed string scope so we need
				// to throw an error to the executor.
				throw new Error("Unclosed string scope.");

				// Not string scope, just return text argument
			} else return new StringEnum(text);

			// If argument is invalid/undefined throw expected argument syntax error.
		} else {
			throw new TypeError(
				`Expected argument of type string, received: ${typeof text}`
			);
		}
	}
}

export { StringEnum };
