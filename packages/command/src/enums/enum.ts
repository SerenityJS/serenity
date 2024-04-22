import type { CommandExecutionState } from "../execution-state";

class Enum {
	public static readonly enums = new Map<string, Enum>();

	public static readonly name: string;

	public static readonly type: number;

	public static readonly symbol: number;

	public constructor(..._arguments: Array<unknown>) {
		this;
	}

	public static extract<O>(
		_state: CommandExecutionState<O | never>
	): Enum | undefined {
		throw new Error("Enum.extract() has not been implemented.");
	}
}

export { Enum };
