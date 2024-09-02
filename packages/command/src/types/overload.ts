import type { Enum } from "../enums";

interface CommandOverload {
	[key: string]: typeof Enum | [typeof Enum, boolean];
}

export { type CommandOverload };
